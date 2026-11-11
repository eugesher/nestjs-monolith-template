import type {
  IProductLedgerRecordCreatedCommand,
  IProductLedgerRecordEventsCommand,
} from '../interfaces';

export interface IProductLedgerPort {
  recordCreated(command: IProductLedgerRecordCreatedCommand): Promise<void>;
  recordEvents(command: IProductLedgerRecordEventsCommand): Promise<void>;
}

export const PRODUCT_LEDGER_PORT = Symbol('PRODUCT_LEDGER_PORT');
