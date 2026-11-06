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
  ORDER_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
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
    OrderGetManyRepository.provider,
    OrderGetOneRepository.provider,
    OrderPlaceRepository.provider,
    OrderProductStockCoreAdapter.provider,
    OrderIdempotencyCoreAdapter.provider,
    OrderLedgerQueueAdapter.provider,
    ConfigValueProvider.provide({
      provide: ORDER_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      property: 'REDIS_COMMAND_TIMEOUT_MS',
    }),
    ConfigValueProvider.provide({
      provide: ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
      property: 'LEDGER_RETRY_ATTEMPTS',
    }),
  ],
})
export class OrderModule {}
