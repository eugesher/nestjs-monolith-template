import type { Maybe } from '@acme-libs/toolkit';

export interface INoteGetManyCommand {
  page: Maybe<number>;
  limit: Maybe<number>;
  subjectType: Maybe<string>;
  subjectId: Maybe<string>;
  resolved: Maybe<boolean>;
  authorId: string;
}
