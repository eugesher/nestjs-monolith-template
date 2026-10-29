import { Maybe } from '@acme-libs/toolkit';

export interface IItemWriteCommand {
  itemId: string;
  ownerId: string;
  expectedVersion: Maybe<number>;
}
