import { DomainEvent } from '@acme-libs/toolkit';

import { IProductStockAddView } from './product-stock-add.view';

export interface IProductStockAddWriteView {
  stock: IProductStockAddView;
  productStockId: string;
  events: DomainEvent<string>[];
}
