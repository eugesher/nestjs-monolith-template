import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import type { ThrottlerStorage } from '@nestjs/throttler';

import { TlsHelper } from '@acme-libs/config';

@Injectable()
export class ThrottleRedisStorage implements ThrottlerStorage, OnApplicationShutdown {
  private static readonly KEY_PREFIX = 'throttle:';
  private static readonly INCREMENT_SCRIPT = [
    "local hits = redis.call('INCR', KEYS[1])",
    "if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end",
    "return { hits, redis.call('PTTL', KEYS[1]) }",
  ].join('\n');

  private readonly redis: Redis;

  constructor(
    config: ConfigService,
    @InjectPinoLogger(ThrottleRedisStorage.name)
    private readonly logger: PinoLogger,
  ) {
    const host = config.getOrThrow<string>('REDIS_HOST');
    const port = config.getOrThrow<number>('REDIS_PORT');
    const password = config.getOrThrow<string>('REDIS_PASSWORD');
    const commandTimeout = config.getOrThrow<number>('REDIS_COMMAND_TIMEOUT_MS');
    const caPath = config.getOrThrow<string>('REDIS_TLS_CA');
    const tls = TlsHelper.options(caPath);

    this.redis = new Redis({
      host,
      port,
      password,
      tls,
      enableOfflineQueue: false,
      commandTimeout,
    });
    this.redis.on('error', (error: Error) => {
      this.logger.warn(
        { err: error },
        'Redis connection error, requests pass unlimited until it reconnects',
      );
    });
  }

  public async increment(
    key: string,
    ttl: number,
    limit: number,
  ): ReturnType<ThrottlerStorage['increment']> {
    try {
      const evalReply = await this.redis.eval(
        ThrottleRedisStorage.INCREMENT_SCRIPT,
        1,
        `${ThrottleRedisStorage.KEY_PREFIX}${key}`,
        ttl,
      );
      const [totalHits, ttlMs] = evalReply as [number, number];
      const timeToExpire = Math.ceil(ttlMs / 1000);
      const isBlocked = totalHits > limit;

      return {
        totalHits,
        timeToExpire,
        isBlocked,
        timeToBlockExpire: isBlocked ? timeToExpire : 0,
      };
    } catch (error) {
      this.logger.warn(
        { err: error },
        'Throttle counter is unavailable, the request passes unlimited',
      );

      return { totalHits: 0, timeToExpire: 0, isBlocked: false, timeToBlockExpire: 0 };
    }
  }

  public async onApplicationShutdown(): Promise<void> {
    if (this.redis.status === 'ready') {
      await this.redis.quit();

      return;
    }

    this.redis.disconnect();
  }
}
