import type { Maybe } from '@acme-libs/toolkit';

export interface IProductGetManyListQuery {
  limit: number;
  offset: number;
  productIds: Maybe<string[]>;
}
