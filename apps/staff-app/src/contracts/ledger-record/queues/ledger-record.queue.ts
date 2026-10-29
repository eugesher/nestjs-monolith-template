export const LEDGER_RECORD_QUEUE = 'ledger-record';

export interface ILedgerRecordProcessorPayload {
  operationKey: string;
  subjectType: string;
  subjectId: string;
  action: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  correlationId: string;
}
