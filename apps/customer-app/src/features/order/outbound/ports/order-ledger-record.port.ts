import { ISubjectLedgerPort } from '@acme-libs-toolkit';

export type IOrderLedgerRecordPort = ISubjectLedgerPort;

export const ORDER_LEDGER_RECORD_PORT = Symbol('ORDER_LEDGER_RECORD_PORT');
