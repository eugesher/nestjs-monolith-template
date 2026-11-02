import { IOrderProductRecord } from './order-product-record.interface';

export interface IOrderInserted {
  id: string;
  customerId: string;
  createdAt: Date;
  products: Pick<IOrderProductRecord, 'id' | 'productId'>[];
}
