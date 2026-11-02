import { IOrderStock } from './order-stock.interface';

export interface IOrderCandidate {
  customerId: string;
  productIds: string[];
  stock: IOrderStock[];
}
