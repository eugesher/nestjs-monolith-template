import type { DomainEventBase } from '@acme-libs/toolkit';

import type { IProductStockAddView } from './product-stock-add.view';

export interface IProductStockAddWriteView {
  stockOnHand: IProductStockAddView;
  productStockId: string;
  domainEvents: DomainEventBase<string>[];
}
