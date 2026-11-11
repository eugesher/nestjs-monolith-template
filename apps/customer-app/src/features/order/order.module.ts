import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { LedgerLibModule } from '@acme-libs/ledger';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';

import { OrderGetManyUseCase, OrderGetOneUseCase, OrderPlaceUseCase } from './application';
import {
  OrderGetManyRepository,
  OrderGetOneRepository,
  OrderIdempotencyCoreAdapter,
  OrderLedgerLibAdapter,
  OrderPlaceRepository,
  OrderProductStockCoreAdapter,
  OrderTransactionAdapter,
} from './infrastructure';
import { OrderController } from './presentation';

@Module({
  imports: [LedgerLibModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [OrderController],
  providers: [
    OrderGetManyUseCase,
    OrderGetOneUseCase,
    OrderPlaceUseCase,
    OrderGetManyRepository.provider,
    OrderGetOneRepository.provider,
    OrderPlaceRepository.provider,
    OrderIdempotencyCoreAdapter.provider,
    OrderLedgerLibAdapter.provider,
    OrderProductStockCoreAdapter.provider,
    OrderTransactionAdapter.provider,
    HttpExceptionFilter,
  ],
})
export class OrderModule {}
