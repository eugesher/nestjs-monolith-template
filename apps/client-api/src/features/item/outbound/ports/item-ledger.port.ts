import { IItemLedgerAppendCommand } from '../interfaces';

export interface IItemLedgerPort {
  append(command: IItemLedgerAppendCommand): Promise<void>;
}

export const ITEM_LEDGER_PORT = Symbol('ITEM_LEDGER_PORT');
