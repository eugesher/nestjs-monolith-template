export const LEDGER_RECORD_QUEUE = 'ledger-record';

export const LEDGER_RECORD_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: true,
};

export interface ILedgerRecordProcessorPayload {
  operationKey: string;
  subjectType: string;
  subjectId: string;
  action: string;
  payload: Record<string, unknown>;
  occurredAt: string;
  correlationId: string;
}
