import { ILedgerRecordEntryFoundRecord, ILedgerRecordEntryInsertCommand } from '../interfaces';

export interface ILedgerRecordAppendRepositoryPort {
  insert(command: ILedgerRecordEntryInsertCommand): Promise<string>;
  findByOperationKey(operationKey: string): Promise<ILedgerRecordEntryFoundRecord>;
}

export const LEDGER_RECORD_APPEND_REPOSITORY_PORT = Symbol('LEDGER_RECORD_APPEND_REPOSITORY_PORT');
