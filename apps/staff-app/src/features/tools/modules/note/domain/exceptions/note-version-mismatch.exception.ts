import { NoteExceptionCodeEnum } from '../enums/note-exception-code.enum';
import { NoteBaseException } from './base/note-base.exception';

export class NoteVersionMismatchException extends NoteBaseException {
  public readonly code = NoteExceptionCodeEnum.NOTE_VERSION_MISMATCH;

  constructor(
    noteId: string,
    attempts: number,
    currentVersion: number,
    message = `Note ${noteId} write lost the optimistic race after ${attempts} attempts`,
  ) {
    super(message, { currentVersion });
  }
}
