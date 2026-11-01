import { Maybe } from '@acme-libs/toolkit';

export interface IOrderGetManyQuery {
  customerId: string;
  page: Maybe<number>;
  size: Maybe<number>;
}
