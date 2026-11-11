import type { ILedgerLibEnqueueCommand } from '@acme-libs/contracts/ledger';

export interface ILedgerLibQueueAddCommand {
  record: ILedgerLibEnqueueCommand;
  timeoutMs: number;
}
