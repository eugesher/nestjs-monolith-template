import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { LedgerLibModule } from '@acme-libs/ledger';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';

import { ProductStockAddUseCase } from './application';
import {
  ProductStockAddRepository,
  ProductStockIdempotencyCoreAdapter,
  ProductStockLedgerLibAdapter,
  ProductStockMovementCoreAdapter,
  ProductStockTransactionAdapter,
} from './infrastructure';
import { ProductStockController } from './presentation';

@Module({
  imports: [LedgerLibModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [ProductStockController],
  providers: [
    HttpExceptionFilter,
    ProductStockAddUseCase,
    ProductStockAddRepository.provider,
    ProductStockIdempotencyCoreAdapter.provider,
    ProductStockMovementCoreAdapter.provider,
    ProductStockLedgerLibAdapter.provider,
    ProductStockTransactionAdapter.provider,
  ],
})
export class ProductStockModule {}
