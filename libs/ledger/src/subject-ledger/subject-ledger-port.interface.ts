import { ISubjectLedgerRecord } from './subject-ledger-record.interface';

export interface ISubjectLedgerPort {
  enqueue(record: ISubjectLedgerRecord): Promise<void>;
}
