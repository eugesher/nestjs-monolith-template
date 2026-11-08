import { NoteVersionInvalidException } from '../exceptions/note-version-invalid.exception';
import {
  INoteRevisionCandidateInput,
  INoteRevisionDraftOutput,
  INoteRevisionRecordInput,
  INoteRevisionSnapshotOutput,
} from '../interfaces';

export class NoteRevisionModel {
  private static readonly FIRST_REVISED_VERSION = 2;

  private constructor(
    public readonly id: string,
    public readonly noteId: string,
    public readonly noteVersion: number,
    public readonly bodyBefore: string,
    public readonly bodyAfter: string,
    public readonly editorId: string,
    public readonly correlationId: string,
    public readonly recordedAt: Date,
  ) {
    Object.freeze(this);
  }

  public static reconstitute(record: INoteRevisionRecordInput): NoteRevisionModel {
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

  public static createDraft(candidate: INoteRevisionCandidateInput): INoteRevisionDraftOutput {
    const { noteId, noteVersion, bodyBefore, bodyAfter, editorId, correlationId } = candidate;
    const validNoteVersion = NoteRevisionModel.validNoteVersion(noteVersion);

    return {
      noteId,
      noteVersion: validNoteVersion,
      bodyBefore,
      bodyAfter,
      editorId,
      correlationId,
    };
  }

  public toSnapshot(): INoteRevisionSnapshotOutput {
    return {
      id: this.id,
      noteId: this.noteId,
      noteVersion: this.noteVersion,
      bodyBefore: this.bodyBefore,
      bodyAfter: this.bodyAfter,
      editorId: this.editorId,
      correlationId: this.correlationId,
      recordedAt: this.recordedAt.toISOString(),
    };
  }

  private static validNoteVersion(noteVersion: number): number {
    if (!Number.isInteger(noteVersion) || noteVersion < NoteRevisionModel.FIRST_REVISED_VERSION) {
      throw new NoteVersionInvalidException(
        noteVersion,
        `NoteRevision.noteVersion must be an integer of at least ${NoteRevisionModel.FIRST_REVISED_VERSION}, got ${noteVersion}`,
      );
    }

    return noteVersion;
  }
}
