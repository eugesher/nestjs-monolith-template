import type { DomainEvent } from '@acme-libs/toolkit';

import type { ProductModel } from '../../../domain';

export interface IProductWriteView {
  product: ProductModel;
  events: DomainEvent<string>[];
}
