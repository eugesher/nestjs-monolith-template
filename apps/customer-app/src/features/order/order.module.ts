import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';
import { LedgerRecordQueueModule } from '@acme-customer/common/shared/ledger-record';

import {
  OrderGetManyUseCase,
  OrderGetOneUseCase,
  OrderLedgerService,
  OrderPlaceUseCase,
} from './application';
import {
  OrderConfigLedgerRetryAttemptsProvider,
  OrderConfigRedisCommandTimeoutMsProvider,
  OrderGetManyRepository,
  OrderGetOneRepository,
  OrderIdempotencyCoreAdapter,
  OrderLedgerQueueAdapter,
  OrderPlaceRepository,
  OrderProductStockCoreAdapter,
} from './infrastructure';
import { OrderController } from './presentation';

@Module({
  imports: [LedgerRecordQueueModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [OrderController],
  providers: [
    HttpExceptionFilter,
    OrderPlaceUseCase,
    OrderGetManyUseCase,
    OrderGetOneUseCase,
    OrderLedgerService,
    OrderGetManyRepository.provider,
    OrderGetOneRepository.provider,
    OrderPlaceRepository.provider,
    OrderProductStockCoreAdapter.provider,
    OrderIdempotencyCoreAdapter.provider,
    OrderLedgerQueueAdapter.provider,
    OrderConfigRedisCommandTimeoutMsProvider,
    OrderConfigLedgerRetryAttemptsProvider,
  ],
})
export class OrderModule {}
