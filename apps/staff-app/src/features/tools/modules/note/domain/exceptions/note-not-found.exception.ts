import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';

import { NoteBaseException } from './base/note-base.exception';

export class NoteNotFoundException extends NoteBaseException {
  public readonly code = NoteErrorCodeEnum.NOTE_NOT_FOUND;

  constructor(noteId: string, message = `Note ${noteId} was not found`) {
    super(message);
  }
}
