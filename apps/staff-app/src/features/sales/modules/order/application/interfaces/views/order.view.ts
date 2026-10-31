import { IOrderProductView } from './order-product.view';

export interface IOrderView {
  id: string;
  customerId: string;
  createdAt: string;
  products: IOrderProductView[];
}
