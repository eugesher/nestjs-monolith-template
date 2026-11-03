import { Maybe } from '@acme-libs/toolkit';

export interface IProductGetManyQuery {
  page: Maybe<number>;
  limit: Maybe<number>;
}
