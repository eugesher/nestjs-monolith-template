import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

import { CACHE_LIB_REDIS_CLIENT_TOKEN } from '../../outbound';

export class CacheLibRedisClientProvider {
  public static readonly provider: FactoryProvider<Redis> = {
    provide: CACHE_LIB_REDIS_CLIENT_TOKEN,
    inject: [ConfigService, PinoLogger],
    useFactory: (config: ConfigService, logger: PinoLogger): Redis =>
      CacheLibRedisClientProvider.create(config, logger),
  };

  private static create(config: ConfigService, logger: PinoLogger): Redis {
    const host = config.getOrThrow<string>('REDIS_HOST');
    const port = config.getOrThrow<number>('REDIS_PORT');
    const password = config.getOrThrow<string>('REDIS_PASSWORD');
    const commandTimeout = config.getOrThrow<number>('REDIS_COMMAND_TIMEOUT_MS');
    const redis = new Redis({ host, port, password, enableOfflineQueue: false, commandTimeout });

    logger.setContext(CacheLibRedisClientProvider.name);
    redis.on('error', (error: Error) => {
      logger.warn({ err: error }, 'Redis connection error, commands fail until it reconnects');
    });

    return redis;
  }
}
