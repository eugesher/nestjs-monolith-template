import { Maybe } from '@acme-libs/toolkit';

export interface INoteGetRevisionsQuery {
  noteId: string;
  authorId: string;
  page: Maybe<number>;
  size: Maybe<number>;
}
