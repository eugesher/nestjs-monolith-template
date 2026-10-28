import { Module } from '@nestjs/common';

import { LedgerCoreModule } from '@acme-core/modules/ledger';
import {
  LedgerCatalogEventsRecordItemArchivedUseCase,
  LedgerCatalogEventsRecordItemCreatedUseCase,
  LedgerCatalogEventsRecordService,
} from './application';
import { LedgerCatalogEventsLedgerCoreAdapter } from './infrastructure';
import { LEDGER_CATALOG_EVENTS_LEDGER_PORT } from './outbound';
import { LedgerCatalogEventsConsumer } from './presentation/ledger-catalog-events.consumer';

@Module({
  imports: [LedgerCoreModule],
  providers: [
    LedgerCatalogEventsConsumer,
    LedgerCatalogEventsRecordItemArchivedUseCase,
    LedgerCatalogEventsRecordItemCreatedUseCase,
    LedgerCatalogEventsRecordService,
    {
      provide: LEDGER_CATALOG_EVENTS_LEDGER_PORT,
      useClass: LedgerCatalogEventsLedgerCoreAdapter,
    },
  ],
})
export class LedgerCatalogEventsModule {}
