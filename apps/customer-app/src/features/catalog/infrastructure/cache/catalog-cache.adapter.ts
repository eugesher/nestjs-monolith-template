import { Inject, Injectable } from '@nestjs/common';

import { CACHE_KEYS, CACHE_PORT, type ICachePort } from '@acme-libs/contracts/cache';
import { IPage } from '@acme-libs/toolkit';

import {
  CATALOG_CACHE_TTL_MS,
  ICatalogCachePort,
  ICatalogCacheReadQuery,
  ICatalogProductRowView,
} from '../../outbound';

@Injectable()
export class CatalogCacheAdapter implements ICatalogCachePort {
  constructor(
    @Inject(CATALOG_CACHE_TTL_MS)
    private readonly ttlMs: number,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  public async read(query: ICatalogCacheReadQuery): Promise<IPage<ICatalogProductRowView>> {
    const { page, limit, compute } = query;
    const key = CACHE_KEYS.catalogPage(page, limit);

    return await this.cache.wrap(key, this.ttlMs, compute);
  }
}
