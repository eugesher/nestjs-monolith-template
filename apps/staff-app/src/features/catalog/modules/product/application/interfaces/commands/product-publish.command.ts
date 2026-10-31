import { Maybe } from '@acme-libs/toolkit';

export interface IProductPublishCommand {
  productId: string;
  expectedVersion: Maybe<number>;
}
