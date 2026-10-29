import { Module } from '@nestjs/common';

import { IdempotencyCommonModule } from '@acme-customer-common/modules/idempotency';
import { LedgerCoreModule } from '@acme-core/modules/ledger';
import { ConfigProviderHelper } from '@acme-libs/config';
import { HttpExceptionFilter } from '@acme-libs/http';
import {
  ItemAccessService,
  ItemArchiveUseCase,
  ItemCreateUseCase,
  ItemGetManyUseCase,
  ItemGetOneUseCase,
  ItemLedgerService,
  ItemRenameUseCase,
  ItemWriteService,
} from './application';
import {
  ItemAccessRepository,
  ItemCreateRepository,
  ItemCrudRepository,
  ItemEventsAdapter,
  ItemIdempotencyCommonAdapter,
  ItemLedgerCoreAdapter,
  ItemTypeOrmModule,
  ItemWriteRepository,
} from './infrastructure';
import {
  ITEM_ACCESS_REPOSITORY_PORT,
  ITEM_CREATE_REPOSITORY_PORT,
  ITEM_CRUD_REPOSITORY_PORT,
  ITEM_EVENTS_PORT,
  ITEM_IDEMPOTENCY_PORT,
  ITEM_LEDGER_PORT,
  ITEM_OCC_RETRY_ATTEMPTS,
  ITEM_WRITE_REPOSITORY_PORT,
} from './outbound';
import { ItemController } from './presentation';

@Module({
  imports: [ItemTypeOrmModule.forFeature(), IdempotencyCommonModule, LedgerCoreModule],
  controllers: [ItemController],
  providers: [
    HttpExceptionFilter,
    ItemCreateUseCase,
    ItemGetManyUseCase,
    ItemGetOneUseCase,
    ItemRenameUseCase,
    ItemArchiveUseCase,
    ItemAccessService,
    ItemWriteService,
    ItemLedgerService,
    { provide: ITEM_ACCESS_REPOSITORY_PORT, useClass: ItemAccessRepository },
    { provide: ITEM_CREATE_REPOSITORY_PORT, useClass: ItemCreateRepository },
    { provide: ITEM_CRUD_REPOSITORY_PORT, useClass: ItemCrudRepository },
    { provide: ITEM_WRITE_REPOSITORY_PORT, useClass: ItemWriteRepository },
    { provide: ITEM_LEDGER_PORT, useClass: ItemLedgerCoreAdapter },
    { provide: ITEM_IDEMPOTENCY_PORT, useClass: ItemIdempotencyCommonAdapter },
    { provide: ITEM_EVENTS_PORT, useClass: ItemEventsAdapter },
    ConfigProviderHelper.value(ITEM_OCC_RETRY_ATTEMPTS, 'OCC_RETRY_ATTEMPTS'),
  ],
})
export class ItemModule {}
