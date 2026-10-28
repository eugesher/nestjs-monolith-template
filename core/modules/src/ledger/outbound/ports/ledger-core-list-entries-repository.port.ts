import { IPage } from '@acme-libs/toolkit';
import { LedgerCoreEntryModel } from '../../domain';
import { ILedgerCoreEntryPageQuery } from '../interfaces';

export interface ILedgerCoreListEntriesRepositoryPort {
  list(query: ILedgerCoreEntryPageQuery): Promise<IPage<LedgerCoreEntryModel>>;
}

export const LEDGER_CORE_LIST_ENTRIES_REPOSITORY_PORT = Symbol(
  'LEDGER_CORE_LIST_ENTRIES_REPOSITORY_PORT',
);
