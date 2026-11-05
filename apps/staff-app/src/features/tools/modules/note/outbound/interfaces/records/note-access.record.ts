import { Note } from '@acme-staff/common/entities';

export type INoteAccessRecord = Pick<
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
>;
