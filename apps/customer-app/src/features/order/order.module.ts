import { Module } from '@nestjs/common';

import { HttpExceptionFilter } from '@acme-libs/http';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ProductStockCoreModule } from '@acme-core/modules/product-stock';
import { LedgerQueueSetupModule } from '@acme-customer/common/shared';

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
  OrderTransactionAdapter,
} from './infrastructure';
import { OrderController } from './presentation';

@Module({
  imports: [LedgerQueueSetupModule, IdempotencyCoreModule, ProductStockCoreModule],
  controllers: [OrderController],
  providers: [
    OrderGetManyUseCase,
    OrderGetOneUseCase,
    OrderPlaceUseCase,
    OrderLedgerService,
    OrderGetManyRepository.provider,
    OrderGetOneRepository.provider,
    OrderPlaceRepository.provider,
    OrderIdempotencyCoreAdapter.provider,
    OrderLedgerQueueAdapter.provider,
    OrderProductStockCoreAdapter.provider,
    OrderTransactionAdapter.provider,
    OrderConfigRedisCommandTimeoutMsProvider,
    OrderConfigLedgerRetryAttemptsProvider,
    HttpExceptionFilter,
  ],
})
export class OrderModule {}
