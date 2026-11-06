import { NoteExceptionCodeEnum } from '../enums/note-exception-code.enum';
import { NoteBaseException } from './base/note-base.exception';

export class NoteVersionInvalidException extends NoteBaseException {
  public readonly code = NoteExceptionCodeEnum.NOTE_VERSION_INVALID;

  constructor(
    version: number,
    message = `Note.version must be a positive integer, got ${version}`,
  ) {
    super(message);
  }
}
