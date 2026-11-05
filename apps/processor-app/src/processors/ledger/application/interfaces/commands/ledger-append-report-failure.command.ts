export interface ILedgerAppendReportFailureCommand {
  operationKey: string;
  attempt: number;
  attempts: number;
  error: Error;
}
