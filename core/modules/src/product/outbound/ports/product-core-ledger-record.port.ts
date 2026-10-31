import { IProductCoreLedgerRecordEnqueueCommand } from '../interfaces';

export interface IProductCoreLedgerRecordPort {
  enqueue(command: IProductCoreLedgerRecordEnqueueCommand): Promise<void>;
}

export const PRODUCT_CORE_LEDGER_RECORD_PORT = Symbol('PRODUCT_CORE_LEDGER_RECORD_PORT');
