import { IPage } from '@acme-libs/toolkit';
import { ILedgerEntryPageQuery, ILedgerStoredEntryView } from '../interfaces';

export interface ILedgerListEntriesRepositoryPort {
  list(query: ILedgerEntryPageQuery): Promise<IPage<ILedgerStoredEntryView>>;
}

export const LEDGER_LIST_ENTRIES_REPOSITORY_PORT = Symbol('LEDGER_LIST_ENTRIES_REPOSITORY_PORT');
