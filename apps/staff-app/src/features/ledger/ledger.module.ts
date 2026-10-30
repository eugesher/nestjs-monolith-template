import { Module } from '@nestjs/common';

import { LedgerListEntriesUseCase } from './application';
import { LedgerListEntriesRepository, LedgerTypeOrmModule } from './infrastructure';
import { LEDGER_LIST_ENTRIES_REPOSITORY_PORT } from './outbound';
import { LedgerController } from './presentation';

@Module({
  imports: [LedgerTypeOrmModule.forFeature()],
  controllers: [LedgerController],
  providers: [
    LedgerListEntriesUseCase,
    { provide: LEDGER_LIST_ENTRIES_REPOSITORY_PORT, useClass: LedgerListEntriesRepository },
  ],
})
export class LedgerModule {}
