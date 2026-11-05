import { Maybe } from '@acme-libs/toolkit';

export interface IOrderGetManyCommand {
  page: Maybe<number>;
  limit: Maybe<number>;
}
