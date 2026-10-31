import { Maybe } from '@acme-libs/toolkit';

export interface IOrderGetManyQuery {
  page: Maybe<number>;
  size: Maybe<number>;
}
