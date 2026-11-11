import type { ILedgerListEntriesQuery, ILedgerListEntriesRecord } from '../interfaces';

export interface ILedgerListEntriesRepositoryPort {
  list(query: ILedgerListEntriesQuery): Promise<ILedgerListEntriesRecord>;
}

export const LEDGER_LIST_ENTRIES_REPOSITORY_PORT = Symbol('LEDGER_LIST_ENTRIES_REPOSITORY_PORT');
