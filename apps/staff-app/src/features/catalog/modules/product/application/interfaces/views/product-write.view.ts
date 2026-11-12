import type { DomainEventBase } from '@acme-libs/toolkit';

import type { ProductModel } from '../../../domain';

export interface IProductWriteView {
  product: ProductModel;
  events: DomainEventBase<string>[];
}
