import { IOrderActiveProductInput } from './order-active-product.input';
import { IOrderStockInput } from './order-stock.input';

export interface IOrderCandidateInput {
  customerId: string;
  productIds: string[];
  products: IOrderActiveProductInput[];
  stock: IOrderStockInput[];
}
