import { Module } from '@nestjs/common';

import { ConfigValueProvider } from '@acme-libs/config';
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
  OrderLedgerQueueAdapter,
  OrderPlaceRepository,
  OrderProductStockCoreAdapter,
} from './infrastructure';
import {
  ORDER_GET_MANY_REPOSITORY_PORT,
  ORDER_GET_ONE_REPOSITORY_PORT,
  ORDER_IDEMPOTENCY_PORT,
  ORDER_LEDGER_RECORD_PORT,
  ORDER_LEDGER_TIMEOUT_MS_TOKEN,
  ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
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
    { provide: ORDER_LEDGER_RECORD_PORT, useClass: OrderLedgerQueueAdapter },
    ConfigValueProvider.provide({
      provide: ORDER_LEDGER_TIMEOUT_MS_TOKEN,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
      property: 'LEDGER_RETRY_ATTEMPTS',
    }),
  ],
})
export class OrderModule {}
