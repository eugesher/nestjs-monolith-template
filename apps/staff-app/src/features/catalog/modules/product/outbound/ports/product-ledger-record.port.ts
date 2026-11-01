import { ISubjectLedgerPort } from '@acme-libs/ledger';

export type IProductLedgerRecordPort = ISubjectLedgerPort;

export const PRODUCT_LEDGER_RECORD_PORT = Symbol('PRODUCT_LEDGER_RECORD_PORT');
