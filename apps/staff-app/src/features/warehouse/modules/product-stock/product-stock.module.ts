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
  PRODUCT_STOCK_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS_TOKEN,
} from './outbound';
import { ProductStockController } from './presentation';

@Module({
  imports: [LedgerRecordQueueModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [ProductStockController],
  providers: [
    HttpExceptionFilter,
    ProductStockAddUseCase,
    ProductStockLedgerService,
    ProductStockAddRepository.provider,
    ProductStockIdempotencyCoreAdapter.provider,
    ProductStockMovementCoreAdapter.provider,
    ProductStockLedgerQueueAdapter.provider,
    ConfigValueProvider.provide({
      provide: PRODUCT_STOCK_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS_TOKEN,
      property: 'LEDGER_RETRY_ATTEMPTS',
    }),
  ],
})
export class ProductStockModule {}
