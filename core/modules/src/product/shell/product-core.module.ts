import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';
import { LEDGER_RECORD_JOB_OPTIONS, LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';
import { PRODUCT_CORE_PORT } from '@acme-core/contracts/product';

import { ProductCoreArchiveUseCase, ProductCoreLedgerService } from '../application';
import {
  ProductCoreArchiveRepository,
  ProductCoreCatalogCacheAdapter,
  ProductCoreLedgerQueueAdapter,
} from '../infrastructure';
import {
  PRODUCT_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS_TOKEN,
} from '../outbound';
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
    ConfigValueProvider.provide({
      provide: PRODUCT_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS_TOKEN,
      property: 'LEDGER_RETRY_ATTEMPTS',
    }),
  ],
})
export class ProductCoreModule {}
