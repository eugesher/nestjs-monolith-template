import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-processor/common/shared/ledger-record';

import {
  LedgerAppendUseCase,
  LedgerAppendReportFailureUseCase,
  LedgerAppendRetryFailedUseCase,
} from './application';
import { LedgerAppendRepository, LedgerAppendQueueAdapter } from './infrastructure';
import { LEDGER_APPEND_REPOSITORY_PORT, LEDGER_APPEND_QUEUE_PORT } from './outbound';
import { LedgerAppendConsumer } from './presentation/ledger-append.consumer';

@Module({
  imports: [LedgerRecordQueueModule],
  providers: [
    LedgerAppendConsumer,
    LedgerAppendUseCase,
    LedgerAppendReportFailureUseCase,
    LedgerAppendRetryFailedUseCase,
    { provide: LEDGER_APPEND_REPOSITORY_PORT, useClass: LedgerAppendRepository },
    { provide: LEDGER_APPEND_QUEUE_PORT, useClass: LedgerAppendQueueAdapter },
  ],
})
export class LedgerModule {}
