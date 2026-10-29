import { NoteModel } from '../../../domain';

export interface INoteEditOutcomeView {
  note: NoteModel;
  edited: boolean;
}
