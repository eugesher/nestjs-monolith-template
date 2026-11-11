import type { NoteRevision } from '@acme-staff/common/entities';

export type INoteGetRevisionsRecord = [
  Pick<
    NoteRevision,
    | 'id'
    | 'noteId'
    | 'noteVersion'
    | 'bodyBefore'
    | 'bodyAfter'
    | 'editorId'
    | 'correlationId'
    | 'recordedAt'
  >[],
  number,
];
