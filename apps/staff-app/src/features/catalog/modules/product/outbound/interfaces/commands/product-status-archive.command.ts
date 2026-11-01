import { Maybe } from '@acme-libs/toolkit';

export interface IProductStatusArchiveCommand {
  productId: string;
  expectedVersion: Maybe<number>;
}
