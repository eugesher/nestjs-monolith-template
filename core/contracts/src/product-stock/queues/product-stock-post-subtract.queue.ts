export const PRODUCT_STOCK_POST_SUBTRACT_QUEUE = 'product-stock-post-subtract';

export interface IProductStockPostSubtractPayload {
  productIds: string[];
  correlationId: string;
}
