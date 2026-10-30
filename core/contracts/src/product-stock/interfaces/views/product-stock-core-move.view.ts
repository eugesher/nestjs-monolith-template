import { IProductStockCoreOnHandView } from './product-stock-core-on-hand.view';

export interface IProductStockCoreMoveView {
  productStockIds: string[];
  stock: IProductStockCoreOnHandView[];
}
