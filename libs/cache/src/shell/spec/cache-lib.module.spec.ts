import { Global, Module, type INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import type { Redis } from 'ioredis';

import { CACHE_LIB_PORT, type ICacheLibPort } from '@acme-libs/contracts/cache';

import { CACHE_LIB_REDIS_CLIENT_TOKEN } from '../../outbound';
import { CacheLibModule } from '../cache-lib.module';

describe('CacheLibModule', () => {
  let warn: jest.SpyInstance;
  let setContext: jest.SpyInstance;
  let connectionError: Promise<void>;
  let context: INestApplicationContext;
  let port: ICacheLibPort;

  beforeEach(async () => {
    warn = jest.spyOn(PinoLogger.prototype, 'warn');
    setContext = jest.spyOn(PinoLogger.prototype, 'setContext');
    connectionError = new Promise<void>((resolve) => {
      warn.mockImplementation((_: unknown, message: string) => {
        if (message === 'Redis connection error, commands fail until it reconnects') {
          resolve();
        }
      });
    });

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
              })[key],
          },
        },
      ],
    })
    class ConfigStubModule {}

    @Module({
      imports: [
        LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
        ConfigStubModule,
        CacheLibModule,
      ],
    })
    class TestModule {}

    context = await NestFactory.createApplicationContext(TestModule, { logger: false });
    port = context.get(CACHE_LIB_PORT);
  });

  afterEach(async () => {
    await context.close();
    jest.restoreAllMocks();
    Object.assign(PinoLogger, { root: undefined });
  });

  it('fails fast while disconnected and bounds every command with REDIS_COMMAND_TIMEOUT_MS', () => {
    const redis = context.get<Redis>(CACHE_LIB_REDIS_CLIENT_TOKEN);

    expect(redis.options).toEqual(
      expect.objectContaining({ enableOfflineQueue: false, commandTimeout: 500 }),
    );
  });

  it('logs a Redis connection error as a warning under the client provider context', async () => {
    await connectionError;

    expect(setContext).toHaveBeenCalledWith('CacheLibRedisClientProvider');
    expect(warn).toHaveBeenCalledWith(
      { err: expect.objectContaining({ code: 'ECONNREFUSED' }) as Error },
      'Redis connection error, commands fail until it reconnects',
    );
  });

  it('fails reads, writes and deletes at once while Redis is down', async () => {
    await connectionError;

    await expect(port.handleGet('k')).rejects.toThrow();
    await expect(port.handleSet({ key: 'k', value: 'v', ttlMs: 1000 })).rejects.toThrow();
    await expect(port.handleDel('k')).rejects.toThrow();
  });

  it('keeps invalidation and read-through working while Redis is down', async () => {
    await connectionError;

    const unlinked = await port.handleDelByPrefix('acme:');
    const value = await port.handleWrap({
      key: 'k',
      ttlMs: 1000,
      compute: () => Promise.resolve('v'),
    });

    expect({ unlinked, value }).toEqual({ unlinked: 0, value: 'v' });
  });
});
