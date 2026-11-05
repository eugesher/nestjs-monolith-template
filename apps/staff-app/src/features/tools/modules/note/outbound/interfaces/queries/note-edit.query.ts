import { Note, NoteRevision } from '@acme-staff/common/entities';

export interface INoteEditUpdateQuery extends Pick<Note, 'id' | 'body' | 'resolved' | 'version'> {
  versionAsRead: number;
}

export type INoteEditRevisionInsertQuery = Pick<
  NoteRevision,
  'noteId' | 'noteVersion' | 'bodyBefore' | 'bodyAfter' | 'editorId' | 'correlationId'
>;
