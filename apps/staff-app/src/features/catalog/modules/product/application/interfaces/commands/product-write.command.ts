import type { Maybe } from '@acme-libs/toolkit';

export interface IProductWriteCommand {
  productId: string;
  expectedVersion: Maybe<number>;
}
