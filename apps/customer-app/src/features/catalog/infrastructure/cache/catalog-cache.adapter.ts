import { Inject, Injectable } from '@nestjs/common';

import { CACHE_KEYS, CACHE_PORT, type ICachePort } from '@acme-libs/contracts/cache';

import {
  CATALOG_CACHE_TTL_MS_TOKEN,
  ICatalogCachePort,
  ICatalogCacheProductListReadCommand,
  ICatalogCacheProductListView,
} from '../../outbound';

@Injectable()
export class CatalogCacheAdapter implements ICatalogCachePort {
  constructor(
    @Inject(CATALOG_CACHE_TTL_MS_TOKEN)
    private readonly ttlMs: number,
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  public async read(
    command: ICatalogCacheProductListReadCommand,
  ): Promise<ICatalogCacheProductListView> {
    const { page, limit, compute } = command;
    const key = CACHE_KEYS.catalogPage(page, limit);

    return await this.cache.wrap(key, this.ttlMs, compute);
  }
}
