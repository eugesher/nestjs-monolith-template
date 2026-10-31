import { NoteModel } from '../../../domain';

export interface INoteEditSaveCommand {
  noteId: string;
  note: NoteModel;
  versionAsRead: number;
  bodyBefore: string;
  editorId: string;
}
