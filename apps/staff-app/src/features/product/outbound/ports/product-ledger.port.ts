import { IProductLedgerAppendCommand } from '../interfaces';

export interface IProductLedgerPort {
  append(command: IProductLedgerAppendCommand): Promise<void>;
}

export const PRODUCT_LEDGER_PORT = Symbol('PRODUCT_LEDGER_PORT');
