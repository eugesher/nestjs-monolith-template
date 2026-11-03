export interface ILedgerEntryPageQuery {
  page: number;
  limit: number;
  offset: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
