export interface IOrderLedgerRecordPlacedCommand {
  orderId: string;
  customerId: string;
  productIds: string[];
}
