import { IAuthLedgerAppendCommand } from '../interfaces';

export interface IAuthLedgerPort {
  append(command: IAuthLedgerAppendCommand): Promise<void>;
}

export const AUTH_LEDGER_PORT = Symbol('AUTH_LEDGER_PORT');
