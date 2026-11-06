import { NoteExceptionCodeEnum } from '../enums/note-exception-code.enum';
import { NoteBaseException } from './base/note-base.exception';

export class NoteResolvedException extends NoteBaseException {
  public readonly code = NoteExceptionCodeEnum.NOTE_RESOLVED;

  constructor(
    noteId: string,
    message = `Note ${noteId} is resolved and can no longer be modified`,
  ) {
    super(message);
  }
}
