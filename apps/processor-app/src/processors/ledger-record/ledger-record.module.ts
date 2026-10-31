import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-processor-common/shared/ledger-record';
import {
  LedgerRecordAppendUseCase,
  LedgerRecordReportFailureUseCase,
  LedgerRecordRetryFailedUseCase,
} from './application';
import {
  LedgerRecordAppendRepository,
  LedgerRecordQueueAdapter,
  LedgerRecordTypeOrmModule,
} from './infrastructure';
import { LEDGER_RECORD_APPEND_REPOSITORY_PORT, LEDGER_RECORD_QUEUE_PORT } from './outbound';
import { LedgerRecordConsumer } from './presentation/ledger-record.consumer';

@Module({
  imports: [LedgerRecordTypeOrmModule.forFeature(), LedgerRecordQueueModule],
  providers: [
    LedgerRecordConsumer,
    LedgerRecordAppendUseCase,
    LedgerRecordReportFailureUseCase,
    LedgerRecordRetryFailedUseCase,
    { provide: LEDGER_RECORD_APPEND_REPOSITORY_PORT, useClass: LedgerRecordAppendRepository },
    { provide: LEDGER_RECORD_QUEUE_PORT, useClass: LedgerRecordQueueAdapter },
  ],
})
export class LedgerRecordModule {}
