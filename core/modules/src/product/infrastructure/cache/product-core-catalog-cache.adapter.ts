import { Inject, Injectable } from '@nestjs/common';

import { CACHE_KEYS, CACHE_PORT, type ICachePort } from '@acme-libs/contracts/cache';
import { type IProductCoreCatalogCachePort } from '../../outbound';

@Injectable()
export class ProductCoreCatalogCacheAdapter implements IProductCoreCatalogCachePort {
  constructor(
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  public async invalidate(): Promise<void> {
    const prefix = CACHE_KEYS.catalogPrefix();

    await this.cache.delByPrefix(prefix);
  }
}
