import { Maybe } from '@acme-libs/toolkit';

export interface IItemPageQuery {
  page: number;
  size: number;
  ownerId: Maybe<string>;
}
