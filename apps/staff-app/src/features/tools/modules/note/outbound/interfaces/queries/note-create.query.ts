import type { Note } from '@acme-staff/common/entities';

export type INoteCreateInsertQuery = Pick<
  Note,
  'subjectType' | 'subjectId' | 'body' | 'authorId' | 'resolved' | 'version'
>;
