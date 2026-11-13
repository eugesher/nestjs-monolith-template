import type { Maybe } from '@acme-libs/toolkit';

export interface INoteGetManyListQuery {
  limit: number;
  offset: number;
  subjectType: Maybe<string>;
  subjectId: Maybe<string>;
  resolved: Maybe<boolean>;
  authorId: string;
}
