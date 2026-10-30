export interface ILedgerRecordReportFailureCommand {
  operationKey: string;
  attempt: number;
  attempts: number;
  error: Error;
}
