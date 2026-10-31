import { Maybe } from '@acme-libs/toolkit';

export interface IProductCoreArchiveCommand {
  productId: string;
  expectedVersion: Maybe<number>;
}
