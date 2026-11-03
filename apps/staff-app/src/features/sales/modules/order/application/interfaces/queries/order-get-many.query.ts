import { Maybe } from '@acme-libs/toolkit';

export interface IOrderGetManyQuery {
  page: Maybe<number>;
  limit: Maybe<number>;
}
