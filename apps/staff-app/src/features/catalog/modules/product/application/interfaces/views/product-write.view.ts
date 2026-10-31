import { DomainEvent, Maybe } from '@acme-libs/toolkit';
import { ProductModel } from '../../../domain';

export interface IProductWriteView {
  product: ProductModel;
  events: DomainEvent<Maybe<string>>[];
}
