import type { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';

export interface ILedgerCoreQueueAddCommand {
  record: ILedgerRecordProcessorPayload;
  timeoutMs: number;
}
