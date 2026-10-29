import { Maybe } from '@acme-libs/toolkit';

export interface IItemGetOneQuery {
  itemId: string;
  ownerId: Maybe<string>;
}
