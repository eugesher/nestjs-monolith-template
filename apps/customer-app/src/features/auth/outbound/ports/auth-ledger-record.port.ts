import { ISubjectLedgerPort } from '@acme-libs-ledger';

export type IAuthLedgerRecordPort = ISubjectLedgerPort;

export const AUTH_LEDGER_RECORD_PORT = Symbol('AUTH_LEDGER_RECORD_PORT');
