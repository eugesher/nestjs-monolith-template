import { ILedgerEntryPageQuery, ILedgerStoredEntryRecord } from '../interfaces';

export interface ILedgerListEntriesRepositoryPort {
  list(query: ILedgerEntryPageQuery): Promise<[ILedgerStoredEntryRecord[], number]>;
}

export const LEDGER_LIST_ENTRIES_REPOSITORY_PORT = Symbol('LEDGER_LIST_ENTRIES_REPOSITORY_PORT');
