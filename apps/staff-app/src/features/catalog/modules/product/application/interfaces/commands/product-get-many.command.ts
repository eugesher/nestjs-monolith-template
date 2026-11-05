import { Maybe } from '@acme-libs/toolkit';

export interface IProductGetManyCommand {
  page: Maybe<number>;
  limit: Maybe<number>;
}
