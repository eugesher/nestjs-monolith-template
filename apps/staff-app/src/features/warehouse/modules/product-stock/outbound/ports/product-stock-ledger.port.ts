import { IProductStockLedgerRecordEventsCommand } from '../interfaces';

export interface IProductStockLedgerPort {
  recordEvents(command: IProductStockLedgerRecordEventsCommand): Promise<void>;
}

export const PRODUCT_STOCK_LEDGER_PORT = Symbol('PRODUCT_STOCK_LEDGER_PORT');
