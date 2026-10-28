import { LedgerCoreEntryModel } from '../../domain';
import { ILedgerCoreAppendOutcomeView } from '../interfaces';

export interface ILedgerCoreAppendEntryRepositoryPort {
  append(entry: LedgerCoreEntryModel): Promise<ILedgerCoreAppendOutcomeView>;
}

export const LEDGER_CORE_APPEND_ENTRY_REPOSITORY_PORT = Symbol(
  'LEDGER_CORE_APPEND_ENTRY_REPOSITORY_PORT',
);
