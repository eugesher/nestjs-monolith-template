import type { DomainEventBase } from '@acme-libs/toolkit';

import type { IProductStockAddView } from './product-stock-add.view';

export interface IProductStockAddWriteView {
  stock: IProductStockAddView;
  productStockId: string;
  events: DomainEventBase<string>[];
}
