import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-customer-common/shared/ledger-record';
import { IdempotencyCoreModule } from '@acme-core/modules/idempotency';
import { ConfigProviderHelper } from '@acme-libs/config';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  OrderGetManyUseCase,
  OrderGetOneUseCase,
  OrderLedgerService,
  OrderPlaceUseCase,
} from './application';
import {
  OrderCrudRepository,
  OrderIdempotencyCoreAdapter,
  OrderLedgerRecordQueueAdapter,
  OrderPlaceRepository,
  OrderTypeOrmModule,
} from './infrastructure';
import {
  ORDER_CRUD_REPOSITORY_PORT,
  ORDER_IDEMPOTENCY_PORT,
  ORDER_LEDGER_RECORD_PORT,
  ORDER_LEDGER_RECORD_TIMEOUT_MS,
  ORDER_LEDGER_RETRY_ATTEMPTS,
  ORDER_PLACE_REPOSITORY_PORT,
} from './outbound';
import { OrderController } from './presentation';

@Module({
  imports: [OrderTypeOrmModule.forFeature(), LedgerRecordQueueModule, IdempotencyCoreModule],
  controllers: [OrderController],
  providers: [
    HttpExceptionFilter,
    OrderPlaceUseCase,
    OrderGetManyUseCase,
    OrderGetOneUseCase,
    OrderLedgerService,
    { provide: ORDER_CRUD_REPOSITORY_PORT, useClass: OrderCrudRepository },
    { provide: ORDER_PLACE_REPOSITORY_PORT, useClass: OrderPlaceRepository },
    { provide: ORDER_IDEMPOTENCY_PORT, useClass: OrderIdempotencyCoreAdapter },
    { provide: ORDER_LEDGER_RECORD_PORT, useClass: OrderLedgerRecordQueueAdapter },
    ConfigProviderHelper.value(ORDER_LEDGER_RECORD_TIMEOUT_MS, 'REDIS_COMMAND_TIMEOUT_MS'),
    ConfigProviderHelper.value(ORDER_LEDGER_RETRY_ATTEMPTS, 'LEDGER_RETRY_ATTEMPTS'),
  ],
})
export class OrderModule {}
