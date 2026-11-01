import { IProductStockLedgerRecordEnqueueCommand } from '../interfaces';

export interface IProductStockLedgerRecordPort {
  enqueue(command: IProductStockLedgerRecordEnqueueCommand): Promise<void>;
}

export const PRODUCT_STOCK_LEDGER_RECORD_PORT = Symbol('PRODUCT_STOCK_LEDGER_RECORD_PORT');
