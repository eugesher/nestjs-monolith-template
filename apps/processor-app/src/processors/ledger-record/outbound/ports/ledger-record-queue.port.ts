export interface ILedgerRecordQueuePort {
  retryFailed(): Promise<number>;
}

export const LEDGER_RECORD_QUEUE_PORT = Symbol('LEDGER_RECORD_QUEUE_PORT');
