import { ILedgerRecordLedgerAppendCommand, ILedgerRecordLedgerAppendView } from '../interfaces';

export interface ILedgerRecordLedgerPort {
  append(command: ILedgerRecordLedgerAppendCommand): Promise<ILedgerRecordLedgerAppendView>;
}

export const LEDGER_RECORD_LEDGER_PORT = Symbol('LEDGER_RECORD_LEDGER_PORT');
