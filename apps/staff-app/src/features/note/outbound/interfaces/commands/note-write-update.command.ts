import { NoteModel } from '../../../domain';

export interface INoteWriteUpdateCommand {
  note: NoteModel;
  versionAsRead: number;
}
