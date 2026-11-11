import type { IOrderProductOutput } from './order-product.output';

export interface IOrderSnapshotOutput {
  id: string;
  createdAt: string;
  products: IOrderProductOutput[];
}
