import { Inject, Injectable } from '@nestjs/common';
import { Attributes, trace } from '@opentelemetry/api';
import { Redis } from 'ioredis';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { ICachePort } from '@acme-libs/contracts/cache';
import { Maybe } from '@acme-libs/toolkit';
import { REDIS_CLIENT } from './redis-client.token';

@Injectable()
export class RedisCacheAdapter implements ICachePort {
  private static readonly TRACER_NAME = '@acme-libs/cache';
  private static readonly SCAN_BATCH_SIZE = 100;

  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @InjectPinoLogger(RedisCacheAdapter.name)
    private readonly logger: PinoLogger,
  ) {}

  public async get<T>(key: string): Promise<Maybe<T>> {
    return await this.traced('cache.get', { 'cache.key': key }, async (attributes) => {
      const raw = await this.redis.get(key);
      const value = raw === null ? null : (JSON.parse(raw) as T | null);
      const hit = value !== null;

      attributes['cache.hit'] = hit;

      return hit ? value : undefined;
    });
  }

  public async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.traced('cache.set', { 'cache.key': key, 'cache.ttl_ms': ttlMs }, async () => {
      const raw = JSON.stringify(value);

      await this.redis.set(key, raw, 'PX', ttlMs);
    });
  }

  public async del(key: string): Promise<void> {
    await this.traced('cache.del', { 'cache.key': key }, async () => {
      await this.redis.del(key);
    });
  }

  public async delByPrefix(prefix: string): Promise<number> {
    return await this.traced(
      'cache.delByPrefix',
      { 'cache.prefix': prefix },
      async (attributes) => {
        try {
          const unlinked = await this.unlinkByPrefix(prefix);

          attributes['cache.keys_unlinked'] = unlinked;

          return unlinked;
        } catch (error) {
          this.logger.warn(
            { err: error, prefix },
            'Cache invalidation failed, entries expire on TTL',
          );

          return 0;
        }
      },
    );
  }

  public async wrap<T>(key: string, ttlMs: number, compute: () => Promise<T>): Promise<T> {
    const pending = this.inFlight.get(key) as Maybe<Promise<T>>;

    if (pending) {
      return await pending;
    }

    const promise = this.traced('cache.wrap', { 'cache.key': key }, (attributes) =>
      this.readThrough(key, ttlMs, compute, attributes),
    ).finally(() => {
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);

    return await promise;
  }

  private async readThrough<T>(
    key: string,
    ttlMs: number,
    compute: () => Promise<T>,
    attributes: Attributes,
  ): Promise<T> {
    let cached: Maybe<T>;

    try {
      cached = await this.get<T>(key);
    } catch (error) {
      this.logger.warn(
        { err: error, key },
        'Cache read failed, computing the value without caching it',
      );
      attributes['cache.hit'] = false;

      return await compute();
    }

    if (cached !== undefined) {
      attributes['cache.hit'] = true;

      return cached;
    }

    attributes['cache.hit'] = false;

    const value = await compute();

    if (value !== undefined) {
      try {
        await this.set(key, value, ttlMs);
      } catch (error) {
        this.logger.warn({ err: error, key }, 'Cache write failed');
      }
    }

    return value;
  }

  private async unlinkByPrefix(prefix: string): Promise<number> {
    const keyPrefix = this.redis.options.keyPrefix ?? '';
    let cursor = '0';
    let unlinked = 0;

    do {
      const [next, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `${keyPrefix}${prefix}*`,
        'COUNT',
        RedisCacheAdapter.SCAN_BATCH_SIZE,
      );

      cursor = next;

      if (keys.length > 0) {
        const unprefixed = keys.map((key) => key.slice(keyPrefix.length));

        unlinked += await this.redis.unlink(...unprefixed);
      }
    } while (cursor !== '0');

    return unlinked;
  }

  private async traced<T>(
    name: string,
    initial: Attributes,
    work: (attributes: Attributes) => Promise<T>,
  ): Promise<T> {
    const tracer = trace.getTracer(RedisCacheAdapter.TRACER_NAME);

    return await tracer.startActiveSpan(name, async (span) => {
      const attributes: Attributes = { ...initial };

      try {
        return await work(attributes);
      } finally {
        span.setAttributes(attributes);
        span.end();
      }
    });
  }
}
