import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-staff-common/shared/ledger-record';
import { LedgerCoreModule } from '@acme-core/modules/ledger';
import { LedgerRecordAppendUseCase, LedgerRecordReportFailureUseCase } from './application';
import { LedgerRecordLedgerCoreAdapter } from './infrastructure';
import { LEDGER_RECORD_LEDGER_PORT } from './outbound';
import { LedgerRecordConsumer } from './presentation/ledger-record.consumer';

@Module({
  imports: [LedgerRecordQueueModule, LedgerCoreModule],
  providers: [
    LedgerRecordConsumer,
    LedgerRecordAppendUseCase,
    LedgerRecordReportFailureUseCase,
    { provide: LEDGER_RECORD_LEDGER_PORT, useClass: LedgerRecordLedgerCoreAdapter },
  ],
})
export class LedgerRecordModule {}
