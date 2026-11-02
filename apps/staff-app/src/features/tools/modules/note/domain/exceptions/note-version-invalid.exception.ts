import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';
import { NoteBaseException } from './base/note-base.exception';

export class NoteVersionInvalidException extends NoteBaseException {
  public readonly code = NoteErrorCodeEnum.NOTE_VERSION_INVALID;

  constructor(
    version: number,
    message = `Note.version must be a positive integer, got ${version}`,
  ) {
    super(message);
  }
}
