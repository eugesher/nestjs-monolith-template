import { Maybe } from '@acme-libs/toolkit';

export interface IItemRenameCommand {
  itemId: string;
  name: string;
  ownerId: string;
  expectedVersion: Maybe<number>;
}
