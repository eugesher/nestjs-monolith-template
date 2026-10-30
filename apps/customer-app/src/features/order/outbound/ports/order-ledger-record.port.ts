import { IOrderLedgerRecordEnqueueCommand } from '../interfaces';

export interface IOrderLedgerRecordPort {
  enqueue(command: IOrderLedgerRecordEnqueueCommand): Promise<void>;
}

export const ORDER_LEDGER_RECORD_PORT = Symbol('ORDER_LEDGER_RECORD_PORT');
