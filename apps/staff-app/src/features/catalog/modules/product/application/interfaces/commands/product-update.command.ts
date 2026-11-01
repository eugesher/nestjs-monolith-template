import { Maybe } from '@acme-libs/toolkit';

export interface IProductUpdateCommand {
  productId: string;
  name: Maybe<string>;
  expectedVersion: Maybe<number>;
}
