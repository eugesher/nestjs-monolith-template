import { ISubjectLedgerRecord } from './subject-ledger-record.interface';

export interface ISubjectLedgerQueue {
  add(record: ISubjectLedgerRecord): Promise<unknown>;
}
