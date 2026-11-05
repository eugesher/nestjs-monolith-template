export interface ILedgerListEntriesCommand {
  page?: number;
  limit?: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
