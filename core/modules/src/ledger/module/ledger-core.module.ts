import { Module } from '@nestjs/common';

import { LEDGER_CORE_APPEND_PORT } from '@acme-core/contracts/ledger';
import { LedgerCoreAppendEntryUseCase } from '../application';
import { LedgerCoreAppendEntryRepository, LedgerCoreTypeOrmModule } from '../infrastructure';
import { LEDGER_CORE_APPEND_ENTRY_REPOSITORY_PORT } from '../outbound';
import { LedgerCoreAppendFacade } from './ledger-core-append.facade';

@Module({
  imports: [LedgerCoreTypeOrmModule.forFeature()],
  exports: [LEDGER_CORE_APPEND_PORT],
  providers: [
    { provide: LEDGER_CORE_APPEND_PORT, useClass: LedgerCoreAppendFacade },
    LedgerCoreAppendEntryUseCase,
    {
      provide: LEDGER_CORE_APPEND_ENTRY_REPOSITORY_PORT,
      useClass: LedgerCoreAppendEntryRepository,
    },
  ],
})
export class LedgerCoreModule {}
