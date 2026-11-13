import type { Maybe } from '@acme-libs/toolkit';

export interface IOrderGetManyListQuery {
  limit: number;
  offset: number;
  orderIds: Maybe<string[]>;
}
