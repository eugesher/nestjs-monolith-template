import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import type { Maybe } from '@acme-libs/toolkit';
import type { ICacheLibWrapCommand } from '@acme-libs/contracts/cache';

import {
  CACHE_LIB_STORE_PORT,
  CACHE_LIB_TRACER_PORT,
  type ICacheLibStorePort,
  type ICacheLibTracerPort,
  type ICacheLibTracerSpanCommand,
} from '../../outbound';

@Injectable()
export class CacheLibWrapUseCase {
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(
    @Inject(CACHE_LIB_STORE_PORT)
    private readonly store: ICacheLibStorePort,
    @Inject(CACHE_LIB_TRACER_PORT)
    private readonly tracer: ICacheLibTracerPort,
    @InjectPinoLogger(CacheLibWrapUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute<T>(command: ICacheLibWrapCommand<T>): Promise<T> {
    const { key } = command;
    const pending = this.inFlight.get(key) as Maybe<Promise<T>>;

    if (pending) {
      return await pending;
    }

    const promise = this.tracer
      .span({
        name: 'cache.wrap',
        attributes: { 'cache.key': key },
        work: (attributes) => this.readThrough(command, attributes),
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);

    return await promise;
  }

  private async readThrough<T>(
    command: ICacheLibWrapCommand<T>,
    attributes: ICacheLibTracerSpanCommand<T>['attributes'],
  ): Promise<T> {
    const { key, ttlMs, compute } = command;
    let cached: Maybe<T>;

    try {
      cached = await this.store.get<T>(key);
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
        await this.store.set({ key, value, ttlMs });
      } catch (error) {
        this.logger.warn({ err: error, key }, 'Cache write failed');
      }
    }

    return value;
  }
}
