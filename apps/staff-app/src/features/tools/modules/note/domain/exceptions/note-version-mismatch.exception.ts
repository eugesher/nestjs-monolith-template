import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';
import { NoteBaseException } from './base/note-base.exception';

export class NoteVersionMismatchException extends NoteBaseException {
  public readonly code = NoteErrorCodeEnum.NOTE_VERSION_MISMATCH;

  constructor(
    noteId: string,
    attempts: number,
    currentVersion: number,
    message = `Note ${noteId} write lost the optimistic race after ${attempts} attempts`,
  ) {
    super(message, { currentVersion });
  }
}
