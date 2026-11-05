import { Maybe } from '@acme-libs/toolkit';

export interface IOrderGetManyListQuery {
  page: number;
  limit: number;
  offset: number;
  orderIds: Maybe<string[]>;
}
