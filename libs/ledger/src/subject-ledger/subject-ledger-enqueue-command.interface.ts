import { ISubjectLedgerRecord } from './subject-ledger-record.interface';

export interface ISubjectLedgerEnqueueCommand {
  record: ISubjectLedgerRecord;
  timeoutMs: number;
}
