import {
  ILedgerAppendEntryInsertQuery,
  ILedgerAppendEntryInsertRecord,
  ILedgerAppendEntryRecord,
} from '../interfaces';

export interface ILedgerAppendRepositoryPort {
  insert(record: ILedgerAppendEntryInsertQuery): Promise<ILedgerAppendEntryInsertRecord>;
  findByOperationKey(operationKey: string): Promise<ILedgerAppendEntryRecord>;
}

export const LEDGER_APPEND_REPOSITORY_PORT = Symbol('LEDGER_APPEND_REPOSITORY_PORT');
