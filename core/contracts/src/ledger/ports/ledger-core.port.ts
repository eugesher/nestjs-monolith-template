import type { ILedgerCoreEnqueueCommand } from '../interfaces';

export interface ILedgerCorePort {
  handleEnqueue(command: ILedgerCoreEnqueueCommand): Promise<void>;
}

export const LEDGER_CORE_PORT = Symbol('LEDGER_CORE_PORT');
