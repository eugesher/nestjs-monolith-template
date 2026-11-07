import { Inject, Injectable } from '@nestjs/common';

import {
  CACHE_LIB_STORE_PORT,
  CACHE_LIB_TRACER_PORT,
  type ICacheLibStorePort,
  type ICacheLibTracerPort,
} from '../../outbound';

@Injectable()
export class CacheLibDelUseCase {
  constructor(
    @Inject(CACHE_LIB_STORE_PORT)
    private readonly store: ICacheLibStorePort,
    @Inject(CACHE_LIB_TRACER_PORT)
    private readonly tracer: ICacheLibTracerPort,
  ) {}

  public async execute(key: string): Promise<void> {
    await this.tracer.span({
      name: 'cache.del',
      attributes: { 'cache.key': key },
      work: () => this.store.del(key),
    });
  }
}
