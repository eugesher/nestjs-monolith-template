import { BullSetupModule } from '@acme-libs/queue';
import { LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';

export const LedgerQueueModule = BullSetupModule.registerQueue(LEDGER_RECORD_QUEUE);
