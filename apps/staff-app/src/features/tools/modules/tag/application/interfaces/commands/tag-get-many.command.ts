import { Maybe } from '@acme-libs/toolkit';

export interface ITagGetManyCommand {
  page: Maybe<number>;
  limit: Maybe<number>;
}
