import { Maybe } from '@acme-libs/toolkit';

export interface IProductRenameCommand {
  productId: string;
  name: string;
  expectedVersion: Maybe<number>;
}
