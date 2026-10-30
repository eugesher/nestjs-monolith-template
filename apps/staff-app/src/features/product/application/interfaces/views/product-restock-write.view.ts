import { DomainEvent, Maybe } from '@acme-libs/toolkit';
import { IProductStockView } from './product-stock.view';

export interface IProductRestockWriteView {
  stock: IProductStockView;
  productStockId: string;
  events: DomainEvent<Maybe<string>>[];
}
