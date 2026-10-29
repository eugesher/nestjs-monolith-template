import { Maybe } from '@acme-libs/toolkit';

export interface INoteGetManyQuery {
  page: Maybe<number>;
  size: Maybe<number>;
  subjectType: Maybe<string>;
  subjectId: Maybe<string>;
  resolved: Maybe<boolean>;
}
