import { Maybe } from '@acme-libs/toolkit';

export interface IOrderProduct {
  id: Maybe<string>;
  productId: string;
  sku: string;
  name: string;
}
