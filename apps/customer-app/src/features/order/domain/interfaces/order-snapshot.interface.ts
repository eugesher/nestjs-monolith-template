import { IOrderProductRecord } from './order-product-record.interface';

export interface IOrderSnapshot {
  id: string;
  createdAt: string;
  products: IOrderProductRecord[];
}
