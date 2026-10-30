import { IOrderStock } from './order-stock.interface';

export interface IOrderDraft {
  customerId: string;
  productIds: string[];
  stock: IOrderStock[];
}
