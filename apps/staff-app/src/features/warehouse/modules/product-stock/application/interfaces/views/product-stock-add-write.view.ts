import { DomainEvent } from '@acme-libs-toolkit';

import { IProductStockView } from './product-stock.view';

export interface IProductStockAddWriteView {
  stock: IProductStockView;
  productStockId: string;
  events: DomainEvent<string>[];
}
