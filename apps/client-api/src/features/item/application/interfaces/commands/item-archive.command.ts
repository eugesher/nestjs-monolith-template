import { Maybe } from '@acme-libs/toolkit';

export interface IItemArchiveCommand {
  itemId: string;
  ownerId: string;
  expectedVersion: Maybe<number>;
}
