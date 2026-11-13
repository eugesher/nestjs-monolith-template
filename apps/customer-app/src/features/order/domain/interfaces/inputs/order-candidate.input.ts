import type { IOrderActiveProductInput } from './order-active-product.input';
import type { IOrderStockInput } from './order-stock.input';

export interface IOrderCandidateInput {
  customerId: string;
  productIds: string[];
  products: IOrderActiveProductInput[];
  stockOnHand: IOrderStockInput[];
}
