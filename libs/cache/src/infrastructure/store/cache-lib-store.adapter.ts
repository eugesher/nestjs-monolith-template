import { Inject, Injectable, type ClassProvider, type OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';

import type { Maybe } from '@acme-libs/toolkit';

import {
  CACHE_LIB_REDIS_CLIENT_TOKEN,
  CACHE_LIB_STORE_PORT,
  type ICacheLibStorePort,
  type ICacheLibStoreSetCommand,
} from '../../outbound';

@Injectable()
export class CacheLibStoreAdapter implements ICacheLibStorePort, OnApplicationShutdown {
  public static readonly provider: ClassProvider<ICacheLibStorePort> = {
    provide: CACHE_LIB_STORE_PORT,
    useClass: CacheLibStoreAdapter,
  };

  private static readonly SCAN_BATCH_SIZE = 100;

  constructor(
    @Inject(CACHE_LIB_REDIS_CLIENT_TOKEN)
    private readonly redis: Redis,
  ) {}

  public async get<T>(key: string): Promise<Maybe<T>> {
    const raw = await this.redis.get(key);
    const value = raw === null ? null : (JSON.parse(raw) as T | null);

    return value ?? undefined;
  }

  public async set<T>(command: ICacheLibStoreSetCommand<T>): Promise<void> {
    const { key, value, ttlMs } = command;
    const raw = JSON.stringify(value);

    await this.redis.set(key, raw, 'PX', ttlMs);
  }

  public async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  public async unlinkByPrefix(prefix: string): Promise<number> {
    const keyPrefix = this.redis.options.keyPrefix ?? '';
    let cursor = '0';
    let unlinked = 0;

    do {
      const [next, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `${keyPrefix}${prefix}*`,
        'COUNT',
        CacheLibStoreAdapter.SCAN_BATCH_SIZE,
      );

      cursor = next;

      if (keys.length > 0) {
        const unprefixed = keys.map((key) => key.slice(keyPrefix.length));

        unlinked += await this.redis.unlink(...unprefixed);
      }
    } while (cursor !== '0');

    return unlinked;
  }

  public async onApplicationShutdown(): Promise<void> {
    if (this.redis.status === 'ready') {
      await this.redis.quit();

      return;
    }

    this.redis.disconnect();
  }
}
