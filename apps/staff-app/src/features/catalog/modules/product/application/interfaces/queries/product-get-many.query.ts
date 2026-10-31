import { Maybe } from '@acme-libs/toolkit';

export interface IProductGetManyQuery {
  page: Maybe<number>;
  size: Maybe<number>;
}
