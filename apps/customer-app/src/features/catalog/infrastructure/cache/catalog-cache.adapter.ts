import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { CACHE_KEYS, CACHE_LIB_PORT, type ICacheLibPort } from '@acme-libs/contracts/cache';

import {
  CATALOG_CACHE_PORT,
  CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN,
  ICatalogCachePort,
  ICatalogCacheProductListReadCommand,
  ICatalogCacheProductListView,
} from '../../outbound';

@Injectable()
export class CatalogCacheAdapter implements ICatalogCachePort {
  public static readonly provider: ClassProvider<ICatalogCachePort> = {
    provide: CATALOG_CACHE_PORT,
    useClass: CatalogCacheAdapter,
  };

  constructor(
    @Inject(CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN)
    private readonly ttlMs: number,
    @Inject(CACHE_LIB_PORT)
    private readonly cache: ICacheLibPort,
  ) {}

  public async read(
    command: ICatalogCacheProductListReadCommand,
  ): Promise<ICatalogCacheProductListView> {
    const { page, limit, compute } = command;
    const key = CACHE_KEYS.catalogPage(page, limit);

    return await this.cache.handleWrap({ key, ttlMs: this.ttlMs, compute });
  }
}
