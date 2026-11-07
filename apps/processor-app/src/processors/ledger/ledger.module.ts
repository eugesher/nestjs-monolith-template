import { Module } from '@nestjs/common';

import { LedgerQueueSetupModule } from '@acme-processor/common/shared';

import { LedgerAppendReportFailureUseCase, LedgerAppendUseCase } from './application';
import { LedgerAppendRepository } from './infrastructure';
import { LedgerAppendProcessor } from './presentation/ledger-append.processor';

@Module({
  imports: [LedgerQueueSetupModule],
  providers: [
    LedgerAppendProcessor,
    LedgerAppendUseCase,
    LedgerAppendReportFailureUseCase,
    LedgerAppendRepository.provider,
  ],
})
export class LedgerModule {}
