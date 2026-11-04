import { Maybe } from '@acme-libs/toolkit';

export interface INoteGetRevisionsCommand {
  noteId: string;
  authorId: string;
  page: Maybe<number>;
  limit: Maybe<number>;
}
