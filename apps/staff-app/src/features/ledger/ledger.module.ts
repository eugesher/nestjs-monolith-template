import { Module } from '@nestjs/common';

import { LedgerCoreModule } from '@acme-core/modules/ledger';
import { LedgerListEntriesUseCase } from './application';
import { LedgerQueryCoreAdapter } from './infrastructure';
import { LEDGER_QUERY_PORT } from './outbound';
import { LedgerController } from './presentation';

@Module({
  imports: [LedgerCoreModule],
  controllers: [LedgerController],
  providers: [
    LedgerListEntriesUseCase,
    { provide: LEDGER_QUERY_PORT, useClass: LedgerQueryCoreAdapter },
  ],
})
export class LedgerModule {}
