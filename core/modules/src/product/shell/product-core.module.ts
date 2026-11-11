import { Module } from '@nestjs/common';

import { LedgerLibModule } from '@acme-libs/ledger';
import { PRODUCT_CORE_PORT } from '@acme-core/contracts/product';

import { ProductCoreArchiveUseCase } from '../application';
import {
  ProductCoreArchiveRepository,
  ProductCoreCatalogCacheAdapter,
  ProductCoreLedgerLibAdapter,
  ProductCoreTransactionAdapter,
} from '../infrastructure';
import { ProductCoreFacade } from './product-core.facade';

@Module({
  imports: [LedgerLibModule],
  exports: [PRODUCT_CORE_PORT],
  providers: [
    { provide: PRODUCT_CORE_PORT, useClass: ProductCoreFacade },
    ProductCoreArchiveUseCase,
    ProductCoreArchiveRepository.provider,
    ProductCoreCatalogCacheAdapter.provider,
    ProductCoreLedgerLibAdapter.provider,
    ProductCoreTransactionAdapter.provider,
  ],
})
export class ProductCoreModule {}
