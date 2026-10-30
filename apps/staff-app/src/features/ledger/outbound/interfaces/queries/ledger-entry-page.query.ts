export interface ILedgerEntryPageQuery {
  page: number;
  size: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
