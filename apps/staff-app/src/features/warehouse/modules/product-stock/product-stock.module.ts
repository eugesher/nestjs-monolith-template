import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';
import { LedgerQueueSetupModule } from '@acme-staff/common/shared';

import { ProductStockAddUseCase, ProductStockLedgerService } from './application';
import {
  ProductStockAddRepository,
  ProductStockConfigLedgerRetryAttemptsProvider,
  ProductStockConfigRedisCommandTimeoutMsProvider,
  ProductStockIdempotencyCoreAdapter,
  ProductStockLedgerQueueAdapter,
  ProductStockMovementCoreAdapter,
  ProductStockTransactionAdapter,
} from './infrastructure';
import { ProductStockController } from './presentation';

@Module({
  imports: [LedgerQueueSetupModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [ProductStockController],
  providers: [
    HttpExceptionFilter,
    ProductStockAddUseCase,
    ProductStockLedgerService,
    ProductStockAddRepository.provider,
    ProductStockIdempotencyCoreAdapter.provider,
    ProductStockMovementCoreAdapter.provider,
    ProductStockLedgerQueueAdapter.provider,
    ProductStockTransactionAdapter.provider,
    ProductStockConfigRedisCommandTimeoutMsProvider,
    ProductStockConfigLedgerRetryAttemptsProvider,
  ],
})
export class ProductStockModule {}
