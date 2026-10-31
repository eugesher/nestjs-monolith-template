export interface IProductStockCorePostSubtractEnqueueCommand {
  productIds: string[];
  correlationId: string;
}
