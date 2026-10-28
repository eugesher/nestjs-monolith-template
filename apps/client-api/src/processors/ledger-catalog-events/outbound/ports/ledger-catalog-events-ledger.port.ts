import {
  ILedgerCatalogEventsLedgerAppendCommand,
  ILedgerCatalogEventsLedgerAppendView,
} from '../interfaces';

export interface ILedgerCatalogEventsLedgerPort {
  append(
    command: ILedgerCatalogEventsLedgerAppendCommand,
  ): Promise<ILedgerCatalogEventsLedgerAppendView>;
}

export const LEDGER_CATALOG_EVENTS_LEDGER_PORT = Symbol('LEDGER_CATALOG_EVENTS_LEDGER_PORT');
