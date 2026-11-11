import { IOrderLedgerRecordPlacedCommand } from '../interfaces';

export interface IOrderLedgerPort {
  recordPlaced(command: IOrderLedgerRecordPlacedCommand): Promise<void>;
}

export const ORDER_LEDGER_PORT = Symbol('ORDER_LEDGER_PORT');
