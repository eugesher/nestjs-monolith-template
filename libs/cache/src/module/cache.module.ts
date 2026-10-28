import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { PinoLogger } from 'nestjs-pino';

import { CACHE_PORT } from '@acme-libs/contracts/cache';
import { RedisCacheAdapter } from '../redis/redis-cache.adapter';
import { RedisClientOptions } from '../redis/redis-client.options';
import { REDIS_CLIENT } from '../redis/redis-client.token';

@Global()
@Module({
  exports: [CACHE_PORT],
  providers: [
    { provide: CACHE_PORT, useClass: RedisCacheAdapter },
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService, PinoLogger],
      useFactory: (config: ConfigService, logger: PinoLogger): Redis => {
        const url = config.getOrThrow<string>('REDIS_URL');
        const options = new RedisClientOptions(config);
        const redis = new Redis(url, options);

        logger.setContext(CacheModule.name);
        redis.on('error', (error: Error) => {
          logger.warn({ err: error }, 'Redis connection error, commands fail until it reconnects');
        });

        return redis;
      },
    },
  ],
})
export class CacheModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  public async onApplicationShutdown(): Promise<void> {
    if (this.redis.status === 'ready') {
      await this.redis.quit();

      return;
    }

    this.redis.disconnect();
  }
}
