import { ILedgerRecordEntryDraft } from '../../domain';
import { ILedgerRecordAppendOutcomeView } from '../interfaces';

export interface ILedgerRecordAppendRepositoryPort {
  append(entry: ILedgerRecordEntryDraft): Promise<ILedgerRecordAppendOutcomeView>;
}

export const LEDGER_RECORD_APPEND_REPOSITORY_PORT = Symbol('LEDGER_RECORD_APPEND_REPOSITORY_PORT');
