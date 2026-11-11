import { Inject, Injectable } from '@nestjs/common';

import type { Maybe } from '@acme-libs/toolkit';

import {
  CACHE_LIB_STORE_PORT,
  CACHE_LIB_TRACER_PORT,
  type ICacheLibStorePort,
  type ICacheLibTracerPort,
} from '../../outbound';

@Injectable()
export class CacheLibGetUseCase {
  constructor(
    @Inject(CACHE_LIB_STORE_PORT)
    private readonly store: ICacheLibStorePort,
    @Inject(CACHE_LIB_TRACER_PORT)
    private readonly tracer: ICacheLibTracerPort,
  ) {}

  public async execute<T>(key: string): Promise<Maybe<T>> {
    return await this.tracer.span({
      name: 'cache.get',
      attributes: { 'cache.key': key },
      work: async (attributes) => {
        const value = await this.store.get<T>(key);

        attributes['cache.hit'] = value !== undefined;

        return value;
      },
    });
  }
}
