import { IOrderProductRecord } from './order-product-record.interface';

export interface IOrderRecord {
  id: string;
  customerId: string;
  createdAt: Date;
  products: IOrderProductRecord[];
}
