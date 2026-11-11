import type { IProductCoreLedgerRecordArchivedCommand } from '../interfaces';

export interface IProductCoreLedgerPort {
  recordArchived(command: IProductCoreLedgerRecordArchivedCommand): Promise<void>;
}

export const PRODUCT_CORE_LEDGER_PORT = Symbol('PRODUCT_CORE_LEDGER_PORT');
