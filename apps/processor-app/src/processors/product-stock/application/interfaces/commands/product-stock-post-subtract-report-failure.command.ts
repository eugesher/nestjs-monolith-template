export interface IProductStockPostSubtractReportFailureCommand {
  productIds: string[];
  attempt: number;
  attempts: number;
  error: Error;
}
