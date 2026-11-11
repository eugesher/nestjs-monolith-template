import type { IAuthLedgerRecordRegisteredCommand } from '../interfaces';

export interface IAuthLedgerPort {
  recordRegistered(command: IAuthLedgerRecordRegisteredCommand): Promise<void>;
}

export const AUTH_LEDGER_PORT = Symbol('AUTH_LEDGER_PORT');
