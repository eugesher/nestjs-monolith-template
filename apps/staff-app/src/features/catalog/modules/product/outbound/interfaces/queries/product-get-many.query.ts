import { Maybe } from '@acme-libs/toolkit';

export interface IProductGetManyListQuery {
  page: number;
  limit: number;
  offset: number;
  productIds: Maybe<string[]>;
}
