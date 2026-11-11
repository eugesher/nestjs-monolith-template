import { Inject, Injectable } from '@nestjs/common';

import type { ICacheLibSetCommand } from '@acme-libs/contracts/cache';

import {
  CACHE_LIB_STORE_PORT,
  CACHE_LIB_TRACER_PORT,
  type ICacheLibStorePort,
  type ICacheLibTracerPort,
} from '../../outbound';

@Injectable()
export class CacheLibSetUseCase {
  constructor(
    @Inject(CACHE_LIB_STORE_PORT)
    private readonly store: ICacheLibStorePort,
    @Inject(CACHE_LIB_TRACER_PORT)
    private readonly tracer: ICacheLibTracerPort,
  ) {}

  public async execute<T>(command: ICacheLibSetCommand<T>): Promise<void> {
    const { key, value, ttlMs } = command;

    await this.tracer.span({
      name: 'cache.set',
      attributes: { 'cache.key': key, 'cache.ttl_ms': ttlMs },
      work: () => this.store.set({ key, value, ttlMs }),
    });
  }
}
