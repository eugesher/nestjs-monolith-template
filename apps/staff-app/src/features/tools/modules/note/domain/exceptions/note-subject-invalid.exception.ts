import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';
import { NoteBaseException } from './base/note-base.exception';

export class NoteSubjectInvalidException extends NoteBaseException {
  public readonly code = NoteErrorCodeEnum.NOTE_SUBJECT_INVALID;

  constructor(message = 'A subject filter needs both subjectType and subjectId, or neither') {
    super(message);
  }
}
