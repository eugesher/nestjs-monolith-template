import { Note } from '@acme-staff/common/entities';

type INoteGetManyRecordItem = Pick<
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

export type INoteGetManyRecord = [INoteGetManyRecordItem[], number];
