import { IAuthLedgerRecordEnqueueCommand } from '../interfaces';

export interface IAuthLedgerRecordPort {
  enqueue(command: IAuthLedgerRecordEnqueueCommand): Promise<void>;
}

export const AUTH_LEDGER_RECORD_PORT = Symbol('AUTH_LEDGER_RECORD_PORT');
