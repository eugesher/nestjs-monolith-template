import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

import { LEDGER_RECORD_JOB_OPTIONS, LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';
import { PRODUCT_CORE_PORT } from '@acme-core/contracts/product';
import { ConfigProviderHelper } from '@acme-libs/config';
import { ProductCoreArchiveUseCase } from '../application';
import {
  ProductCoreArchiveRepository,
  ProductCoreCatalogCacheAdapter,
  ProductCoreLedgerRecordQueueAdapter,
  ProductCoreTypeOrmModule,
} from '../infrastructure';
import {
  PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT,
  PRODUCT_CORE_CATALOG_CACHE_PORT,
  PRODUCT_CORE_LEDGER_RECORD_PORT,
  PRODUCT_CORE_LEDGER_RECORD_TIMEOUT_MS,
  PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS,
} from '../outbound';
import { ProductCoreFacade } from './product-core.facade';

@Module({
  imports: [
    ProductCoreTypeOrmModule.forFeature(),
    BullModule.registerQueue({
      name: LEDGER_RECORD_QUEUE,
      defaultJobOptions: LEDGER_RECORD_JOB_OPTIONS,
    }),
  ],
  exports: [PRODUCT_CORE_PORT],
  providers: [
    { provide: PRODUCT_CORE_PORT, useClass: ProductCoreFacade },
    ProductCoreArchiveUseCase,
    { provide: PRODUCT_CORE_ARCHIVE_REPOSITORY_PORT, useClass: ProductCoreArchiveRepository },
    { provide: PRODUCT_CORE_LEDGER_RECORD_PORT, useClass: ProductCoreLedgerRecordQueueAdapter },
    { provide: PRODUCT_CORE_CATALOG_CACHE_PORT, useClass: ProductCoreCatalogCacheAdapter },
    ConfigProviderHelper.value(PRODUCT_CORE_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class ProductCoreModule {}
