import { BullModule } from '@nestjs/bull';

import { LEDGER_RECORD_JOB_OPTIONS, LEDGER_RECORD_QUEUE } from '@acme-core/contracts/ledger';

export const LedgerRecordQueueModule = BullModule.registerQueue({
  name: LEDGER_RECORD_QUEUE,
  defaultJobOptions: LEDGER_RECORD_JOB_OPTIONS,
});
