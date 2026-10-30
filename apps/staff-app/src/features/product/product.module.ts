import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-staff-common/shared/ledger-record';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { LedgerCoreModule } from '@acme-core/modules/ledger';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';
import { ConfigProviderHelper } from '@acme-libs/config';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  ProductAccessService,
  ProductArchiveUseCase,
  ProductCreateUseCase,
  ProductGetManyUseCase,
  ProductGetOneUseCase,
  ProductLedgerService,
  ProductRenameUseCase,
  ProductRestockUseCase,
  ProductWriteService,
} from './application';
import {
  ProductAccessRepository,
  ProductCreateRepository,
  ProductCrudRepository,
  ProductIdempotencyCoreAdapter,
  ProductLedgerCoreAdapter,
  ProductLedgerRecordQueueAdapter,
  ProductRestockRepository,
  ProductStockCoreAdapter,
  ProductTypeOrmModule,
  ProductWriteRepository,
} from './infrastructure';
import {
  PRODUCT_ACCESS_REPOSITORY_PORT,
  PRODUCT_CREATE_REPOSITORY_PORT,
  PRODUCT_CRUD_REPOSITORY_PORT,
  PRODUCT_IDEMPOTENCY_PORT,
  PRODUCT_LEDGER_PORT,
  PRODUCT_LEDGER_RECORD_PORT,
  PRODUCT_LEDGER_RECORD_TIMEOUT_MS,
  PRODUCT_LEDGER_RETRY_ATTEMPTS,
  PRODUCT_OCC_RETRY_ATTEMPTS,
  PRODUCT_RESTOCK_REPOSITORY_PORT,
  PRODUCT_STOCK_PORT,
  PRODUCT_WRITE_REPOSITORY_PORT,
} from './outbound';
import { ProductController } from './presentation';

@Module({
  imports: [
    ProductTypeOrmModule.forFeature(),
    LedgerRecordQueueModule,
    IdempotencyCoreModule,
    LedgerCoreModule,
    ProductStockCoreModule,
  ],
  controllers: [ProductController],
  providers: [
    HttpExceptionFilter,
    ProductCreateUseCase,
    ProductGetManyUseCase,
    ProductGetOneUseCase,
    ProductRenameUseCase,
    ProductArchiveUseCase,
    ProductRestockUseCase,
    ProductAccessService,
    ProductWriteService,
    ProductLedgerService,
    { provide: PRODUCT_ACCESS_REPOSITORY_PORT, useClass: ProductAccessRepository },
    { provide: PRODUCT_CREATE_REPOSITORY_PORT, useClass: ProductCreateRepository },
    { provide: PRODUCT_CRUD_REPOSITORY_PORT, useClass: ProductCrudRepository },
    { provide: PRODUCT_WRITE_REPOSITORY_PORT, useClass: ProductWriteRepository },
    { provide: PRODUCT_RESTOCK_REPOSITORY_PORT, useClass: ProductRestockRepository },
    { provide: PRODUCT_LEDGER_PORT, useClass: ProductLedgerCoreAdapter },
    { provide: PRODUCT_IDEMPOTENCY_PORT, useClass: ProductIdempotencyCoreAdapter },
    { provide: PRODUCT_STOCK_PORT, useClass: ProductStockCoreAdapter },
    { provide: PRODUCT_LEDGER_RECORD_PORT, useClass: ProductLedgerRecordQueueAdapter },
    ConfigProviderHelper.value(PRODUCT_OCC_RETRY_ATTEMPTS, 'OCC_RETRY_ATTEMPTS'),
    ConfigProviderHelper.value(PRODUCT_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(PRODUCT_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class ProductModule {}
