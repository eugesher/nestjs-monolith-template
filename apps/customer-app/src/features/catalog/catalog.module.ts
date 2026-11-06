import { Module } from '@nestjs/common';

import { CatalogProductListUseCase } from './application';
import {
  CatalogCacheAdapter,
  CatalogConfigCacheTtlMsDefaultProvider,
  CatalogProductListRepository,
} from './infrastructure';
import { CatalogController } from './presentation';

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogProductListUseCase,
    CatalogProductListRepository.provider,
    CatalogCacheAdapter.provider,
    CatalogConfigCacheTtlMsDefaultProvider,
  ],
})
export class CatalogModule {}
