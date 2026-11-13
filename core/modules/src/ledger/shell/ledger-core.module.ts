import { Module } from '@nestjs/common';

import { BullSetupModule } from '@acme-libs/queue';
import { LEDGER_CORE_PORT, LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';

import { LedgerCoreEnqueueUseCase } from '../application';
import {
  LedgerCoreConfigEnqueueRetryAttemptsProvider,
  LedgerCoreConfigRedisCommandTimeoutMsProvider,
  LedgerCoreQueueAdapter,
} from '../infrastructure';
import { LedgerCoreFacade } from './ledger-core.facade';

@Module({
  imports: [BullSetupModule.registerQueue(LEDGER_RECORD_QUEUE)],
  exports: [LEDGER_CORE_PORT],
  providers: [
    { provide: LEDGER_CORE_PORT, useClass: LedgerCoreFacade },
    LedgerCoreEnqueueUseCase,
    LedgerCoreQueueAdapter.provider,
    LedgerCoreConfigRedisCommandTimeoutMsProvider,
    LedgerCoreConfigEnqueueRetryAttemptsProvider,
  ],
})
export class LedgerCoreModule {}
