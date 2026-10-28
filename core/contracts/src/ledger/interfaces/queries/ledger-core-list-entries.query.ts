export interface ILedgerCoreListEntriesQuery {
  page?: number;
  size?: number;
  subjectType?: string;
  subjectId?: string;
  correlationId?: string;
}
