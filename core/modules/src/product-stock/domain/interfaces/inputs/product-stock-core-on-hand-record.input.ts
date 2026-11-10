import { IProductStockCoreSumInput } from './product-stock-core-sum.input';

export interface IProductStockCoreOnHandRecordInput {
  productIds: string[];
  sums: IProductStockCoreSumInput[];
}
