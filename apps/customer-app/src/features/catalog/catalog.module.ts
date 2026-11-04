import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';

import { CatalogProductListUseCase } from './application';
import { CatalogCacheAdapter, CatalogProductListRepository } from './infrastructure';
import {
  CATALOG_CACHE_PORT,
  CATALOG_CACHE_TTL_MS,
  CATALOG_PRODUCT_LIST_REPOSITORY_PORT,
} from './outbound';
import { CatalogController } from './presentation';

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogProductListUseCase,
    { provide: CATALOG_PRODUCT_LIST_REPOSITORY_PORT, useClass: CatalogProductListRepository },
    { provide: CATALOG_CACHE_PORT, useClass: CatalogCacheAdapter },
    ConfigProviderHelper.value(CATALOG_CACHE_TTL_MS, 'CACHE_TTL_MS_DEFAULT'),
  ],
})
export class CatalogModule {}
