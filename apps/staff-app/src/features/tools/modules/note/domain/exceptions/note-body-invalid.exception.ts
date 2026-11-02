import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';
import { NoteBaseException } from './base/note-base.exception';

export class NoteBodyInvalidException extends NoteBaseException {
  public readonly code = NoteErrorCodeEnum.NOTE_BODY_INVALID;

  constructor(
    maxLength: number,
    message = `Note.body must be a non-empty string of at most ${maxLength} characters`,
  ) {
    super(message);
  }
}
