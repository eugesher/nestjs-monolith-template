import { Maybe } from '@acme-libs/toolkit';

export interface INotePageQuery {
  page: number;
  limit: number;
  offset: number;
  subjectType: Maybe<string>;
  subjectId: Maybe<string>;
  resolved: Maybe<boolean>;
  authorId: string;
}
