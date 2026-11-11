import type { Note } from '@acme-staff/common/entities';

export type INoteGetManyRecord = [
  Pick<
    Note,
    | 'id'
    | 'subjectType'
    | 'subjectId'
    | 'body'
    | 'authorId'
    | 'resolved'
    | 'version'
    | 'createdAt'
    | 'updatedAt'
  >[],
  number,
];
