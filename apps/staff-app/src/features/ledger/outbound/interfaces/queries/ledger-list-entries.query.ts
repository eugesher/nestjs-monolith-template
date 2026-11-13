export interface ILedgerListEntriesQuery {
  limit: number;
  offset: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
