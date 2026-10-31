import { Maybe } from '@acme-libs/toolkit';

export interface INotePageQuery {
  page: number;
  size: number;
  subjectType: Maybe<string>;
  subjectId: Maybe<string>;
  resolved: Maybe<boolean>;
  authorId: string;
}
