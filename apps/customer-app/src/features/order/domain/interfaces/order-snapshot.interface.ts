import { IOrderProduct } from './order-product.interface';

export interface IOrderSnapshot {
  id: string;
  createdAt: string;
  products: IOrderProduct[];
}
