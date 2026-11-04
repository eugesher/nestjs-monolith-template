import { IPage } from '@acme-libs/toolkit';

import { ILedgerEntryPageQuery, ILedgerStoredEntryRecord } from '../interfaces';

export interface ILedgerListEntriesRepositoryPort {
  list(query: ILedgerEntryPageQuery): Promise<IPage<ILedgerStoredEntryRecord>>;
}

export const LEDGER_LIST_ENTRIES_REPOSITORY_PORT = Symbol('LEDGER_LIST_ENTRIES_REPOSITORY_PORT');
