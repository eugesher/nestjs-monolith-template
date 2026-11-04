import { NoteRevision } from '@acme-staff/common/entities';

type INoteGetRevisionsRecordItem = Pick<
  NoteRevision,
  | 'id'
  | 'noteId'
  | 'noteVersion'
  | 'bodyBefore'
  | 'bodyAfter'
  | 'editorId'
  | 'correlationId'
  | 'recordedAt'
>;

export type INoteGetRevisionsRecord = [INoteGetRevisionsRecordItem[], number];
