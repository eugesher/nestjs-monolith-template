import { Module } from '@nestjs/common';

import { ConfigProviderHelper } from '@acme-libs/config';
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
  OrderGetManyRepository,
  OrderGetOneRepository,
  OrderIdempotencyCoreAdapter,
  OrderLedgerRecordQueueAdapter,
  OrderPlaceRepository,
  OrderProductStockCoreAdapter,
} from './infrastructure';
import {
  ORDER_GET_MANY_REPOSITORY_PORT,
  ORDER_GET_ONE_REPOSITORY_PORT,
  ORDER_IDEMPOTENCY_PORT,
  ORDER_LEDGER_RECORD_PORT,
  ORDER_LEDGER_RECORD_TIMEOUT_MS,
  ORDER_LEDGER_RETRY_ATTEMPTS,
  ORDER_PLACE_REPOSITORY_PORT,
  ORDER_PRODUCT_STOCK_PORT,
} from './outbound';
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
    { provide: ORDER_GET_MANY_REPOSITORY_PORT, useClass: OrderGetManyRepository },
    { provide: ORDER_GET_ONE_REPOSITORY_PORT, useClass: OrderGetOneRepository },
    { provide: ORDER_PLACE_REPOSITORY_PORT, useClass: OrderPlaceRepository },
    { provide: ORDER_PRODUCT_STOCK_PORT, useClass: OrderProductStockCoreAdapter },
    { provide: ORDER_IDEMPOTENCY_PORT, useClass: OrderIdempotencyCoreAdapter },
    { provide: ORDER_LEDGER_RECORD_PORT, useClass: OrderLedgerRecordQueueAdapter },
    ConfigProviderHelper.value(ORDER_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(ORDER_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class OrderModule {}
