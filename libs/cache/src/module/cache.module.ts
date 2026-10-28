import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

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
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const url = config.getOrThrow<string>('REDIS_URL');
        const options = new RedisClientOptions(config);

        return new Redis(url, options);
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
