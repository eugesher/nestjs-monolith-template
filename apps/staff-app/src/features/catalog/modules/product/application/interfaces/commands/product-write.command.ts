import { Maybe } from '@acme-libs/toolkit';

export interface IProductWriteCommand {
  productId: string;
  expectedVersion: Maybe<number>;
}
