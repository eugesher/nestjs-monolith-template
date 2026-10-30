import { Maybe } from '@acme-libs/toolkit';

export interface ICatalogGetManyQuery {
  page: Maybe<number>;
  size: Maybe<number>;
}
