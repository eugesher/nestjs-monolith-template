export interface ILedgerCoreEntryPageQuery {
  page: number;
  size: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
