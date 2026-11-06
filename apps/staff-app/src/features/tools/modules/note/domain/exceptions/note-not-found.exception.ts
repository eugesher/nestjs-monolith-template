import { NoteExceptionCodeEnum } from '../enums/note-exception-code.enum';

import { NoteBaseException } from './base/note-base.exception';

export class NoteNotFoundException extends NoteBaseException {
  public readonly code = NoteExceptionCodeEnum.NOTE_NOT_FOUND;

  constructor(noteId: string, message = `Note ${noteId} was not found`) {
    super(message);
  }
}
