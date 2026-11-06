import { Module } from '@nestjs/common';

import { LedgerRecordQueueModule } from '@acme-processor/common/shared/ledger-record';

import { LedgerAppendUseCase, LedgerAppendReportFailureUseCase } from './application';
import { LedgerAppendRepository } from './infrastructure';
import { LedgerAppendProcessor } from './presentation/ledger-append.processor';

@Module({
  imports: [LedgerRecordQueueModule],
  providers: [
    LedgerAppendProcessor,
    LedgerAppendUseCase,
    LedgerAppendReportFailureUseCase,
    LedgerAppendRepository.provider,
  ],
})
export class LedgerModule {}
