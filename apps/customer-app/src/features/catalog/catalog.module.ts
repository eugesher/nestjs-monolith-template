import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';

import { CatalogGetManyUseCase } from './application';
import { CatalogCacheAdapter, CatalogCrudRepository } from './infrastructure';
import { CATALOG_CACHE_PORT, CATALOG_CACHE_TTL_MS, CATALOG_CRUD_REPOSITORY_PORT } from './outbound';
import { CatalogController } from './presentation';

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogGetManyUseCase,
    { provide: CATALOG_CRUD_REPOSITORY_PORT, useClass: CatalogCrudRepository },
    { provide: CATALOG_CACHE_PORT, useClass: CatalogCacheAdapter },
    ConfigProviderHelper.value(CATALOG_CACHE_TTL_MS, 'CACHE_TTL_MS_DEFAULT'),
  ],
})
export class CatalogModule {}
