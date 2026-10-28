import { Global, INestApplicationContext, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Redis } from 'ioredis';
import { LoggerModule, PinoLogger } from 'nestjs-pino';

import { CacheModule } from '../cache.module';

describe('CacheModule', () => {
  describe('the Redis client', () => {
    let warn: jest.SpyInstance;
    let setContext: jest.SpyInstance;
    let context: INestApplicationContext;

    beforeEach(async () => {
      warn = jest.spyOn(PinoLogger.prototype, 'warn');
      setContext = jest.spyOn(PinoLogger.prototype, 'setContext');

      @Global()
      @Module({
        providers: [
          {
            provide: ConfigService,
            useValue: {
              getOrThrow: (key: string) =>
                ({ REDIS_URL: 'redis://127.0.0.1:1', REDIS_COMMAND_TIMEOUT_MS: 500 })[key],
            },
          },
        ],
        exports: [ConfigService],
      })
      class ConfigStubModule {}

      @Module({
        imports: [
          LoggerModule.forRoot({ pinoHttp: { level: 'silent' } }),
          ConfigStubModule,
          CacheModule,
        ],
      })
      class TestModule {}

      context = await NestFactory.createApplicationContext(TestModule, { logger: false });
    });

    afterEach(async () => {
      await context.close();
      jest.restoreAllMocks();
      Object.assign(PinoLogger, { root: undefined });
    });

    it('logs a connection error as a warning under the module context', async () => {
      await new Promise<void>((resolve) => {
        warn.mockImplementation(() => resolve());
      });

      expect(setContext).toHaveBeenCalledWith('CacheModule');
      expect(warn).toHaveBeenCalledWith(
        { err: expect.objectContaining({ code: 'ECONNREFUSED' }) as Error },
        'Redis connection error, commands fail until it reconnects',
      );
    });
  });

  describe('onApplicationShutdown', () => {
    it('quits gracefully when the connection is ready', async () => {
      const redis = {
        status: 'ready',
        quit: jest.fn().mockResolvedValue('OK'),
        disconnect: jest.fn(),
      };

      await new CacheModule(redis as unknown as Redis).onApplicationShutdown();

      expect(redis.quit).toHaveBeenCalledTimes(1);
      expect(redis.disconnect).not.toHaveBeenCalled();
    });

    it.each(['connecting', 'reconnecting', 'wait'])(
      'disconnects at once when the connection is %s, instead of queuing QUIT forever',
      async (status) => {
        const redis = { status, quit: jest.fn().mockResolvedValue('OK'), disconnect: jest.fn() };

        await new CacheModule(redis as unknown as Redis).onApplicationShutdown();

        expect(redis.disconnect).toHaveBeenCalledTimes(1);
        expect(redis.quit).not.toHaveBeenCalled();
      },
    );
  });
});
