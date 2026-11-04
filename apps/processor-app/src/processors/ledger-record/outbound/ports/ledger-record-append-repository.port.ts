import { ILedgerRecordAppendEntryRecord, ILedgerRecordAppendEntryInsertQuery } from '../interfaces';

export interface ILedgerRecordAppendRepositoryPort {
  insert(record: ILedgerRecordAppendEntryInsertQuery): Promise<string>;
  findByOperationKey(operationKey: string): Promise<ILedgerRecordAppendEntryRecord>;
}

export const LEDGER_RECORD_APPEND_REPOSITORY_PORT = Symbol('LEDGER_RECORD_APPEND_REPOSITORY_PORT');
