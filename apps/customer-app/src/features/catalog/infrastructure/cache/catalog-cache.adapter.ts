import { Inject, Injectable } from '@nestjs/common';

import { CACHE_KEYS, CACHE_PORT, type ICachePort } from '@acme-libs/contracts/cache';
import { IPage } from '@acme-libs/toolkit';
import {
  CATALOG_CACHE_TTL_MS,
  type ICatalogCachePort,
  ICatalogCacheReadQuery,
  ICatalogProductStockView,
} from '../../outbound';

@Injectable()
export class CatalogCacheAdapter implements ICatalogCachePort {
  constructor(
    @Inject(CATALOG_CACHE_TTL_MS)
    private readonly ttlMs: number,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  public read(query: ICatalogCacheReadQuery): Promise<IPage<ICatalogProductStockView>> {
    const { page, size, compute } = query;
    const key = CACHE_KEYS.catalogPage(page, size);

    return this.cache.wrap(key, this.ttlMs, compute);
  }
}
