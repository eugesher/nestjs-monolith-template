import { IProductLedgerRecordEnqueueCommand } from '../interfaces';

export interface IProductLedgerRecordPort {
  enqueue(command: IProductLedgerRecordEnqueueCommand): Promise<void>;
}

export const PRODUCT_LEDGER_RECORD_PORT = Symbol('PRODUCT_LEDGER_RECORD_PORT');
