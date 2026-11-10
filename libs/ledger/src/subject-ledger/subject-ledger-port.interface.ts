import { ISubjectLedgerEnqueueCommand } from './subject-ledger-enqueue-command.interface';

export interface ISubjectLedgerPort {
  enqueue(command: ISubjectLedgerEnqueueCommand): Promise<void>;
}
