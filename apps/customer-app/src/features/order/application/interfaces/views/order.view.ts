import { IOrderProductView } from './order-product.view';

export interface IOrderView {
  id: string;
  createdAt: string;
  products: IOrderProductView[];
}
