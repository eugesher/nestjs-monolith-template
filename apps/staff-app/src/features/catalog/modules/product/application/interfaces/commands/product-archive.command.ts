import { Maybe } from '@acme-libs/toolkit';

export interface IProductArchiveCommand {
  productId: string;
  expectedVersion: Maybe<number>;
}
