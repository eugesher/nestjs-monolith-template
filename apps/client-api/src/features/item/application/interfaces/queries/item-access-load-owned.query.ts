import { Maybe } from '@acme-libs/toolkit';

export interface IItemAccessLoadOwnedQuery {
  itemId: string;
  ownerId: Maybe<string>;
}
