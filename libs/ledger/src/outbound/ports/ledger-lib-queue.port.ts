import { ILedgerLibQueueAddCommand } from '../interfaces';

export interface ILedgerLibQueuePort {
  add(command: ILedgerLibQueueAddCommand): Promise<void>;
}

export const LEDGER_LIB_QUEUE_PORT = Symbol('LEDGER_LIB_QUEUE_PORT');
