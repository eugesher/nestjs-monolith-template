import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';

import { CatalogProductListUseCase } from './application';
import { CatalogCacheAdapter, CatalogProductListRepository } from './infrastructure';
import { CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN } from './outbound';
import { CatalogController } from './presentation';

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogProductListUseCase,
    CatalogProductListRepository.provider,
    CatalogCacheAdapter.provider,
    ConfigValueProvider.provide({
      provide: CATALOG_CACHE_TTL_MS_DEFAULT_TOKEN,
      property: 'CACHE_TTL_MS_DEFAULT',
    }),
  ],
})
export class CatalogModule {}
