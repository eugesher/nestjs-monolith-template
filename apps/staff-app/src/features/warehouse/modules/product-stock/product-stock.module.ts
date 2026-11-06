import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';
import { HttpExceptionFilter } from '@acme-libs/http';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';
import { LedgerRecordQueueModule } from '@acme-staff/common/shared/ledger-record';

import { ProductStockAddUseCase, ProductStockLedgerService } from './application';
import {
  ProductStockAddRepository,
  ProductStockIdempotencyCoreAdapter,
  ProductStockLedgerQueueAdapter,
  ProductStockMovementCoreAdapter,
} from './infrastructure';
import {
  PRODUCT_STOCK_ADD_REPOSITORY_PORT,
  PRODUCT_STOCK_IDEMPOTENCY_PORT,
  PRODUCT_STOCK_LEDGER_RECORD_PORT,
  PRODUCT_STOCK_LEDGER_RECORD_TIMEOUT_MS,
  PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS,
  PRODUCT_STOCK_MOVEMENT_PORT,
} from './outbound';
import { ProductStockController } from './presentation';

@Module({
  imports: [LedgerRecordQueueModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [ProductStockController],
  providers: [
    HttpExceptionFilter,
    ProductStockAddUseCase,
    ProductStockLedgerService,
    { provide: PRODUCT_STOCK_ADD_REPOSITORY_PORT, useClass: ProductStockAddRepository },
    { provide: PRODUCT_STOCK_IDEMPOTENCY_PORT, useClass: ProductStockIdempotencyCoreAdapter },
    { provide: PRODUCT_STOCK_MOVEMENT_PORT, useClass: ProductStockMovementCoreAdapter },
    { provide: PRODUCT_STOCK_LEDGER_RECORD_PORT, useClass: ProductStockLedgerQueueAdapter },
    ConfigValueProvider.provide({
      provide: PRODUCT_STOCK_LEDGER_RECORD_TIMEOUT_MS,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS,
      property: 'LEDGER_RETRY_ATTEMPTS',
    }),
  ],
})
export class ProductStockModule {}
