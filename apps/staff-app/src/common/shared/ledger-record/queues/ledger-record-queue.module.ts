import { BullModule } from '@nestjs/bull';

import { LEDGER_RECORD_QUEUE } from '@acme-staff-contracts/ledger-record';

export const LedgerRecordQueueModule = BullModule.registerQueue({
  name: LEDGER_RECORD_QUEUE,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  },
});
