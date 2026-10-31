import { Maybe } from '@acme-libs/toolkit';
import { NoteErrorCodeEnum } from '../enums/note-error-code.enum';
import { NoteDomainException } from '../exceptions/note-domain.exception';
import { INoteRevisionDraft } from '../interfaces/note-revision-draft.interface';
import { INoteRevisionRecord } from '../interfaces/note-revision-record.interface';

export class NoteRevisionModel {
  private static readonly FIRST_REVISED_VERSION = 2;

  private constructor(
    public readonly id: Maybe<string>,
    public readonly noteId: string,
    public readonly noteVersion: number,
    public readonly bodyBefore: string,
    public readonly bodyAfter: string,
    public readonly editorId: string,
    public readonly correlationId: string,
    public readonly recordedAt: Maybe<Date>,
  ) {
    Object.freeze(this);
  }

  public static create(draft: INoteRevisionDraft): NoteRevisionModel {
    const { noteId, noteVersion, bodyBefore, bodyAfter, editorId, correlationId } = draft;
    const validNoteVersion = NoteRevisionModel.validNoteVersion(noteVersion);

    return new NoteRevisionModel(
      undefined,
      noteId,
      validNoteVersion,
      bodyBefore,
      bodyAfter,
      editorId,
      correlationId,
      undefined,
    );
  }

  public static reconstitute(record: INoteRevisionRecord): NoteRevisionModel {
    const { id, noteId, noteVersion, bodyBefore, bodyAfter, editorId, correlationId, recordedAt } =
      record;
    const validNoteVersion = NoteRevisionModel.validNoteVersion(noteVersion);

    return new NoteRevisionModel(
      id,
      noteId,
      validNoteVersion,
      bodyBefore,
      bodyAfter,
      editorId,
      correlationId,
      recordedAt,
    );
  }

  private static validNoteVersion(noteVersion: number): number {
    if (!Number.isInteger(noteVersion) || noteVersion < NoteRevisionModel.FIRST_REVISED_VERSION) {
      throw new NoteDomainException(
        NoteErrorCodeEnum.NOTE_VERSION_INVALID,
        `NoteRevision.noteVersion must be an integer of at least ${NoteRevisionModel.FIRST_REVISED_VERSION}, got ${noteVersion}`,
      );
    }

    return noteVersion;
  }
}
