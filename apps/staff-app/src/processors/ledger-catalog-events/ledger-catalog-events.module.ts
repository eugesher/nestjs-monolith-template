import { Module } from '@nestjs/common';

import { LedgerCoreModule } from '@acme-core/modules/ledger';
import {
  LedgerCatalogEventsRecordProductArchivedUseCase,
  LedgerCatalogEventsRecordProductCreatedUseCase,
  LedgerCatalogEventsRecordService,
} from './application';
import { LedgerCatalogEventsLedgerCoreAdapter } from './infrastructure';
import { LEDGER_CATALOG_EVENTS_LEDGER_PORT } from './outbound';
import { LedgerCatalogEventsConsumer } from './presentation/ledger-catalog-events.consumer';

@Module({
  imports: [LedgerCoreModule],
  providers: [
    LedgerCatalogEventsConsumer,
    LedgerCatalogEventsRecordProductArchivedUseCase,
    LedgerCatalogEventsRecordProductCreatedUseCase,
    LedgerCatalogEventsRecordService,
    {
      provide: LEDGER_CATALOG_EVENTS_LEDGER_PORT,
      useClass: LedgerCatalogEventsLedgerCoreAdapter,
    },
  ],
})
export class LedgerCatalogEventsModule {}
