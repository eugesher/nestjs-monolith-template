export const PRODUCT_STOCK_POST_SUBTRACT_QUEUE = 'product-stock-post-subtract';

export const PRODUCT_STOCK_POST_SUBTRACT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: true,
};

export interface IProductStockPostSubtractPayload {
  productIds: string[];
  correlationId: string;
}
