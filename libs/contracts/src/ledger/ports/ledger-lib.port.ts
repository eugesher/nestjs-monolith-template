import type { ILedgerLibEnqueueCommand } from '../interfaces';

export interface ILedgerLibPort {
  handleEnqueue(command: ILedgerLibEnqueueCommand): Promise<void>;
}

export const LEDGER_LIB_PORT = Symbol('LEDGER_LIB_PORT');
