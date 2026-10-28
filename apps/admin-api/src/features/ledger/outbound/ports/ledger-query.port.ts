import { IPage } from '@acme-libs/toolkit';
import { ILedgerQueryEntryView, ILedgerQueryListEntriesQuery } from '../interfaces';

export interface ILedgerQueryPort {
  list(query: ILedgerQueryListEntriesQuery): Promise<IPage<ILedgerQueryEntryView>>;
}

export const LEDGER_QUERY_PORT = Symbol('LEDGER_QUERY_PORT');
