import { Module } from '@nestjs/common';

import { LEDGER_CORE_APPEND_PORT, LEDGER_CORE_QUERY_PORT } from '@acme-core/contracts/ledger';
import { LedgerCoreAppendEntryUseCase, LedgerCoreListEntriesUseCase } from '../application';
import {
  LedgerCoreAppendEntryRepository,
  LedgerCoreListEntriesRepository,
  LedgerCoreTypeOrmModule,
} from '../infrastructure';
import {
  LEDGER_CORE_APPEND_ENTRY_REPOSITORY_PORT,
  LEDGER_CORE_LIST_ENTRIES_REPOSITORY_PORT,
} from '../outbound';
import { LedgerCoreAppendFacade } from './ledger-core-append.facade';
import { LedgerCoreQueryFacade } from './ledger-core-query.facade';

@Module({
  imports: [LedgerCoreTypeOrmModule.forFeature()],
  exports: [LEDGER_CORE_APPEND_PORT, LEDGER_CORE_QUERY_PORT],
  providers: [
    { provide: LEDGER_CORE_APPEND_PORT, useClass: LedgerCoreAppendFacade },
    { provide: LEDGER_CORE_QUERY_PORT, useClass: LedgerCoreQueryFacade },
    LedgerCoreAppendEntryUseCase,
    LedgerCoreListEntriesUseCase,
    {
      provide: LEDGER_CORE_APPEND_ENTRY_REPOSITORY_PORT,
      useClass: LedgerCoreAppendEntryRepository,
    },
    {
      provide: LEDGER_CORE_LIST_ENTRIES_REPOSITORY_PORT,
      useClass: LedgerCoreListEntriesRepository,
    },
  ],
})
export class LedgerCoreModule {}
