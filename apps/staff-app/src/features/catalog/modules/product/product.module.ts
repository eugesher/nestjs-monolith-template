import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';
import { HttpExceptionFilter } from '@acme-libs/http';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductCoreModule } from '@acme-core/modules/product';
import { LedgerRecordQueueModule } from '@acme-staff/common/shared/ledger-record';

import {
  ProductAccessService,
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductLedgerService,
  ProductPublishUseCase,
  ProductUpdateUseCase,
  ProductWriteService,
} from './application';
import {
  ProductAccessRepository,
  ProductCatalogCacheAdapter,
  ProductCreateRepository,
  ProductGetManyRepository,
  ProductIdempotencyCoreAdapter,
  ProductLedgerRecordQueueAdapter,
  ProductStatusCoreAdapter,
  ProductWriteRepository,
} from './infrastructure';
import {
  PRODUCT_ACCESS_REPOSITORY_PORT,
  PRODUCT_CATALOG_CACHE_PORT,
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_GET_MANY_REPOSITORY_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
  PRODUCT_LEDGER_RECORD_PORT,
  PRODUCT_LEDGER_RECORD_TIMEOUT_MS,
  PRODUCT_LEDGER_RETRY_ATTEMPTS,
  PRODUCT_OCC_RETRY_ATTEMPTS,
  PRODUCT_STATUS_PORT,
  PRODUCT_WRITE_REPOSITORY_PORT,
} from './outbound';
import { ProductController } from './presentation';

@Module({
  imports: [LedgerRecordQueueModule, IdempotencyCoreModule, ProductCoreModule],
  controllers: [ProductController],
  providers: [
    HttpExceptionFilter,
    ProductCreateUseCase,
    ProductGetManyUseCase,
    ProductGetOneUseCase,
    ProductUpdateUseCase,
    ProductPublishUseCase,
    ProductArchiveUseCase,
    ProductAccessService,
    ProductWriteService,
    ProductLedgerService,
    { provide: PRODUCT_ACCESS_REPOSITORY_PORT, useClass: ProductAccessRepository },
    { provide: PRODUCT_CREATE_REPOSITORY_PORT, useClass: ProductCreateRepository },
    { provide: PRODUCT_GET_MANY_REPOSITORY_PORT, useClass: ProductGetManyRepository },
    { provide: PRODUCT_WRITE_REPOSITORY_PORT, useClass: ProductWriteRepository },
    { provide: PRODUCT_STATUS_PORT, useClass: ProductStatusCoreAdapter },
    { provide: PRODUCT_IDEMPOTENCY_PORT, useClass: ProductIdempotencyCoreAdapter },
    { provide: PRODUCT_LEDGER_RECORD_PORT, useClass: ProductLedgerRecordQueueAdapter },
    { provide: PRODUCT_CATALOG_CACHE_PORT, useClass: ProductCatalogCacheAdapter },
    ConfigProviderHelper.value(PRODUCT_OCC_RETRY_ATTEMPTS, 'OCC_RETRY_ATTEMPTS'),
    ConfigProviderHelper.value(PRODUCT_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(PRODUCT_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class ProductModule {}
