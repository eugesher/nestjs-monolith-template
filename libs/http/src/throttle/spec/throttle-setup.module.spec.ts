import { Controller, Global, Module, Post, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, NestFactory } from '@nestjs/core';
import { getStorageToken, type ThrottlerStorage } from '@nestjs/throttler';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

import { HttpExceptionFilter } from '../../filters/http-exception.filter';
import { AuthThrottle } from '../decorators/throttle-auth.decorator';
import { ThrottleRedisStorage } from '../storage/throttle-redis.storage';
import { ThrottleSetupModule } from '../throttle-setup.module';

describe('ThrottleSetupModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.spyOn(PinoLogger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(PinoLogger.prototype, 'error').mockImplementation(() => undefined);

    @Global()
    @Module({
      exports: [ConfigService],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: (key: string) =>
              ({
                REDIS_HOST: '127.0.0.1',
                REDIS_PORT: 1,
                REDIS_PASSWORD: 'password',
                REDIS_COMMAND_TIMEOUT_MS: 500,
                HTTP_TRUST_PROXY_HOPS: 1,
                THROTTLE_TTL_MS: 60000,
                THROTTLE_LIMIT: 300,
                THROTTLE_AUTH_TTL_MS: 30000,
                THROTTLE_AUTH_LIMIT: 10,
              })[key],
          },
        },
      ],
    })
    class ConfigStubModule {}

    @Controller()
    class FixtureController {
      @Post('login')
      @AuthThrottle()
      public handleLogin(): void {
        return undefined;
      }

      @Post('orders')
      public handleOrders(): void {
        return undefined;
      }
    }

    @Module({
      imports: [
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        ConfigStubModule,
        ThrottleSetupModule.forRoot(),
      ],
      controllers: [FixtureController],
      providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
    })
    class TestModule {}

    app = await NestFactory.create(TestModule, { logger: false });
    await app.listen(0, '127.0.0.1');
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
    Object.assign(PinoLogger, { root: undefined });
  });

  it('trusts as many proxy hops as HTTP_TRUST_PROXY_HOPS', () => {
    const express = app.getHttpAdapter().getInstance() as { get: (setting: string) => unknown };

    expect(express.get('trust proxy')).toBe(1);
  });

  it('counts the hits in Redis', () => {
    expect(app.get(getStorageToken())).toBeInstanceOf(ThrottleRedisStorage);
  });

  it('limits every route by THROTTLE_* and the routes of AuthThrottle also by THROTTLE_AUTH_*', async () => {
    const increment = jest
      .spyOn(app.get<ThrottlerStorage>(getStorageToken()), 'increment')
      .mockResolvedValue({
        totalHits: 1,
        timeToExpire: 60,
        isBlocked: false,
        timeToBlockExpire: 0,
      });
    const url = await app.getUrl();

    await fetch(`${url}/login`, { method: 'POST' });

    const login = increment.mock.calls.map(([, ttl, limit, , name]) => ({ name, ttl, limit }));

    increment.mockClear();
    await fetch(`${url}/orders`, { method: 'POST' });

    const orders = increment.mock.calls.map(([, ttl, limit, , name]) => ({ name, ttl, limit }));

    expect({ login, orders }).toEqual({
      login: [
        { name: 'auth', ttl: 30000, limit: 10 },
        { name: 'default', ttl: 60000, limit: 300 },
      ],
      orders: [{ name: 'default', ttl: 60000, limit: 300 }],
    });
  });

  it('answers 429 with its own message once a limit is spent', async () => {
    jest.spyOn(app.get<ThrottlerStorage>(getStorageToken()), 'increment').mockResolvedValue({
      totalHits: 11,
      timeToExpire: 30,
      isBlocked: true,
      timeToBlockExpire: 30,
    });
    const url = await app.getUrl();

    const response = await fetch(`${url}/login`, { method: 'POST' });
    const body: unknown = await response.json();

    expect({ status: response.status, body }).toEqual({
      status: 429,
      body: { statusCode: 429, message: 'Too many requests' },
    });
  });
});
