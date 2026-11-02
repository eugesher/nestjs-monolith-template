import { IOrderActiveProduct } from './order-active-product.interface';
import { IOrderStock } from './order-stock.interface';

export interface IOrderCandidate {
  customerId: string;
  productIds: string[];
  products: IOrderActiveProduct[];
  stock: IOrderStock[];
}
