export interface ILedgerAppendEntryDraft {
  operationKey: string;
  subjectType: string;
  subjectId: string;
  action: string;
  payload: Record<string, unknown>;
  correlationId: string;
  occurredAt: Date;
}
