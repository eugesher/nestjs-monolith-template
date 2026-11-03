export interface ILedgerListEntriesQuery {
  page?: number;
  limit?: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
