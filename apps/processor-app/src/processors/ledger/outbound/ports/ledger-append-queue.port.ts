export interface ILedgerAppendQueuePort {
  retryFailed(): Promise<number>;
}

export const LEDGER_APPEND_QUEUE_PORT = Symbol('LEDGER_APPEND_QUEUE_PORT');
