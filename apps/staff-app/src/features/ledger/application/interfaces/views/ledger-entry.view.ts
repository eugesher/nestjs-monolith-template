export interface ILedgerEntryView {
  id: string;
  operationKey: string;
  subjectType: string;
  subjectId: string;
  action: string;
  payload: Record<string, unknown>;
  correlationId: string;
  occurredAt: string;
  recordedAt: string;
}
