import { Module } from '@nestjs/common';

import { BullSetupModule } from '@acme-libs/queue';
import { LEDGER_LIB_PORT, LEDGER_RECORD_QUEUE } from '@acme-libs/contracts/ledger';

import { LedgerLibEnqueueUseCase } from '../application';
import {
  LedgerLibConfigRedisCommandTimeoutMsProvider,
  LedgerLibConfigRetryAttemptsProvider,
  LedgerLibQueueAdapter,
} from '../infrastructure';
import { LedgerLibFacade } from './ledger-lib.facade';

@Module({
  imports: [BullSetupModule.registerQueue(LEDGER_RECORD_QUEUE)],
  exports: [LEDGER_LIB_PORT],
  providers: [
    { provide: LEDGER_LIB_PORT, useClass: LedgerLibFacade },
    LedgerLibEnqueueUseCase,
    LedgerLibQueueAdapter.provider,
    LedgerLibConfigRedisCommandTimeoutMsProvider,
    LedgerLibConfigRetryAttemptsProvider,
  ],
})
export class LedgerLibModule {}
