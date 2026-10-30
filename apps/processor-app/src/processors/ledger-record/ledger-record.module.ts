import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-processor-common/shared/ledger-record';
import { LedgerCoreModule } from '@acme-core/modules/ledger';
import {
  LedgerRecordAppendUseCase,
  LedgerRecordReportFailureUseCase,
  LedgerRecordRetryFailedUseCase,
} from './application';
import { LedgerRecordLedgerCoreAdapter, LedgerRecordQueueAdapter } from './infrastructure';
import { LEDGER_RECORD_LEDGER_PORT, LEDGER_RECORD_QUEUE_PORT } from './outbound';
import { LedgerRecordConsumer } from './presentation/ledger-record.consumer';

@Module({
  imports: [LedgerRecordQueueModule, LedgerCoreModule],
  providers: [
    LedgerRecordConsumer,
    LedgerRecordAppendUseCase,
    LedgerRecordReportFailureUseCase,
    LedgerRecordRetryFailedUseCase,
    { provide: LEDGER_RECORD_LEDGER_PORT, useClass: LedgerRecordLedgerCoreAdapter },
    { provide: LEDGER_RECORD_QUEUE_PORT, useClass: LedgerRecordQueueAdapter },
  ],
})
export class LedgerRecordModule {}
