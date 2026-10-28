import { ILedgerCoreAppendEntryCommand, ILedgerCoreAppendEntryView } from '../interfaces';

export interface ILedgerCoreAppendPort {
  append(command: ILedgerCoreAppendEntryCommand): Promise<ILedgerCoreAppendEntryView>;
}

export const LEDGER_CORE_APPEND_PORT = Symbol('LEDGER_CORE_APPEND_PORT');
