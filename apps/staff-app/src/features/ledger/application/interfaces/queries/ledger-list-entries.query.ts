export interface ILedgerListEntriesQuery {
  page?: number;
  size?: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
