import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { LedgerCoreModule } from '@acme-core/modules/ledger';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';

import { ProductStockAddUseCase } from './application';
import {
  ProductStockAddRepository,
  ProductStockIdempotencyCoreAdapter,
  ProductStockLedgerCoreAdapter,
  ProductStockMovementCoreAdapter,
  ProductStockTransactionAdapter,
} from './infrastructure';
import { ProductStockController } from './presentation';

@Module({
  imports: [LedgerCoreModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [ProductStockController],
  providers: [
    HttpExceptionFilter,
    ProductStockAddUseCase,
    ProductStockAddRepository.provider,
    ProductStockIdempotencyCoreAdapter.provider,
    ProductStockMovementCoreAdapter.provider,
    ProductStockLedgerCoreAdapter.provider,
    ProductStockTransactionAdapter.provider,
  ],
})
export class ProductStockModule {}
