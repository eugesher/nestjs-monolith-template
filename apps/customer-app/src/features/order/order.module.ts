import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { LedgerCoreModule } from '@acme-core/modules/ledger';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';

import { OrderGetManyUseCase, OrderGetOneUseCase, OrderPlaceUseCase } from './application';
import {
  OrderGetManyRepository,
  OrderGetOneRepository,
  OrderIdempotencyCoreAdapter,
  OrderLedgerCoreAdapter,
  OrderPlaceRepository,
  OrderProductStockCoreAdapter,
  OrderTransactionAdapter,
} from './infrastructure';
import { OrderController } from './presentation';

@Module({
  imports: [LedgerCoreModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [OrderController],
  providers: [
    OrderGetManyUseCase,
    OrderGetOneUseCase,
    OrderPlaceUseCase,
    OrderGetManyRepository.provider,
    OrderGetOneRepository.provider,
    OrderPlaceRepository.provider,
    OrderIdempotencyCoreAdapter.provider,
    OrderLedgerCoreAdapter.provider,
    OrderProductStockCoreAdapter.provider,
    OrderTransactionAdapter.provider,
    HttpExceptionFilter,
  ],
})
export class OrderModule {}
