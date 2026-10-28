export interface ILedgerCoreAppendEntryCommand {
  operationKey: string;
  subjectType: string;
  subjectId: string;
  action: string;
  payload: Record<string, unknown>;
  occurredAt: string;
}
