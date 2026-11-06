import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { CACHE_KEYS, CACHE_PORT, type ICachePort } from '@acme-libs/contracts/cache';

import { IProductCoreCatalogCachePort, PRODUCT_CORE_CATALOG_CACHE_PORT } from '../../outbound';

@Injectable()
export class ProductCoreCatalogCacheAdapter implements IProductCoreCatalogCachePort {
  public static readonly provider: ClassProvider<IProductCoreCatalogCachePort> = {
    provide: PRODUCT_CORE_CATALOG_CACHE_PORT,
    useClass: ProductCoreCatalogCacheAdapter,
  };

  constructor(
    @Inject(CACHE_PORT)
    private readonly cache: ICachePort,
  ) {}

  public async invalidate(): Promise<void> {
    const prefix = CACHE_KEYS.catalogPrefix();

    await this.cache.delByPrefix(prefix);
  }
}
