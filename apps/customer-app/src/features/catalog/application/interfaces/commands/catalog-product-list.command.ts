import type { Maybe } from '@acme-libs/toolkit';

export interface ICatalogProductListCommand {
  page: Maybe<number>;
  limit: Maybe<number>;
}
