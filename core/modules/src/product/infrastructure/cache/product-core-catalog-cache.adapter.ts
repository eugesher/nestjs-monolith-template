import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { CACHE_KEYS, CACHE_LIB_PORT, type ICacheLibPort } from '@acme-libs/contracts/cache';

import { PRODUCT_CORE_CATALOG_CACHE_PORT, type IProductCoreCatalogCachePort } from '../../outbound';

@Injectable()
export class ProductCoreCatalogCacheAdapter implements IProductCoreCatalogCachePort {
  public static readonly provider: ClassProvider<IProductCoreCatalogCachePort> = {
    provide: PRODUCT_CORE_CATALOG_CACHE_PORT,
    useClass: ProductCoreCatalogCacheAdapter,
  };

  constructor(
    @Inject(CACHE_LIB_PORT)
    private readonly cache: ICacheLibPort,
  ) {}

  public async invalidate(): Promise<void> {
    const prefix = CACHE_KEYS.catalogPrefix();

    await this.cache.handleDelByPrefix(prefix);
  }
}
