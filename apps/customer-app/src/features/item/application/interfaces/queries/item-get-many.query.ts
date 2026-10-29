import { Maybe } from '@acme-libs/toolkit';

export interface IItemGetManyQuery {
  page: Maybe<number>;
  size: Maybe<number>;
  ownerId: string;
}
