import { IPage } from '@acme-libs/toolkit';
import { ILedgerCoreEntryView, ILedgerCoreListEntriesQuery } from '../interfaces';

export interface ILedgerCoreQueryPort {
  list(query: ILedgerCoreListEntriesQuery): Promise<IPage<ILedgerCoreEntryView>>;
}

export const LEDGER_CORE_QUERY_PORT = Symbol('LEDGER_CORE_QUERY_PORT');
