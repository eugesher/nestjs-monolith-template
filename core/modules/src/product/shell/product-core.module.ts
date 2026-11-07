import { Module } from '@nestjs/common';

import { BullSetupModule } from '@acme-libs/queue';
import { LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';
import { PRODUCT_CORE_PORT } from '@acme-core/contracts/product';

import { ProductCoreArchiveUseCase, ProductCoreLedgerService } from '../application';
import {
  ProductCoreArchiveRepository,
  ProductCoreCatalogCacheAdapter,
  ProductCoreConfigLedgerRetryAttemptsProvider,
  ProductCoreConfigRedisCommandTimeoutMsProvider,
  ProductCoreLedgerQueueAdapter,
} from '../infrastructure';
import { ProductCoreFacade } from './product-core.facade';

@Module({
  imports: [BullSetupModule.registerQueue(LEDGER_RECORD_QUEUE)],
  exports: [PRODUCT_CORE_PORT],
  providers: [
    { provide: PRODUCT_CORE_PORT, useClass: ProductCoreFacade },
    ProductCoreArchiveUseCase,
    ProductCoreLedgerService,
    ProductCoreArchiveRepository.provider,
    ProductCoreLedgerQueueAdapter.provider,
    ProductCoreCatalogCacheAdapter.provider,
    ProductCoreConfigRedisCommandTimeoutMsProvider,
    ProductCoreConfigLedgerRetryAttemptsProvider,
  ],
})
export class ProductCoreModule {}
