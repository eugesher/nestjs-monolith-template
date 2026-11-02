import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';
import { NoteBaseException } from './base/note-base.exception';

export class NoteResolvedException extends NoteBaseException {
  public readonly code = NoteErrorCodeEnum.NOTE_RESOLVED;

  constructor(
    noteId: string,
    message = `Note ${noteId} is resolved and can no longer be modified`,
  ) {
    super(message);
  }
}
