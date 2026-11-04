import { Maybe } from '@acme-libs/toolkit';

export interface ICatalogGetManyCommand {
  page: Maybe<number>;
  limit: Maybe<number>;
}
