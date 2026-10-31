import { IOrderFoundProductView } from './order-found-product.view';

export interface IOrderFoundView {
  id: string;
  customerId: string;
  createdAt: Date;
  products: IOrderFoundProductView[];
}
