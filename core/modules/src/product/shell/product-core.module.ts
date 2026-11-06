import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { LEDGER_RECORD_JOB_OPTIONS, LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';
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
  imports: [
    BullModule.registerQueue({
      name: LEDGER_RECORD_QUEUE,
      defaultJobOptions: LEDGER_RECORD_JOB_OPTIONS,
    }),
  ],
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
