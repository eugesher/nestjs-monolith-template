import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-processor/common/shared/ledger-record';

import { LedgerAppendUseCase, LedgerAppendReportFailureUseCase } from './application';
import { LedgerAppendRepository } from './infrastructure';
import { LEDGER_APPEND_REPOSITORY_PORT } from './outbound';
import { LedgerAppendConsumer } from './presentation/ledger-append.consumer';

@Module({
  imports: [LedgerRecordQueueModule],
  providers: [
    LedgerAppendConsumer,
    LedgerAppendUseCase,
    LedgerAppendReportFailureUseCase,
    { provide: LEDGER_APPEND_REPOSITORY_PORT, useClass: LedgerAppendRepository },
  ],
})
export class LedgerModule {}
