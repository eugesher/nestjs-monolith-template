export interface ILedgerQueryListEntriesQuery {
  page?: number;
  size?: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
