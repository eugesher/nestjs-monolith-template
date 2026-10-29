import { NoteRevisionModel } from '../../domain';
import { INoteRevisionView } from '../interfaces/views/note-revision.view';

export class NoteRevisionViewMapper {
  public static toView(revision: NoteRevisionModel): INoteRevisionView {
    const recordedAt = revision.recordedAt ?? new Date();

    return {
      id: revision.id ?? '',
      noteId: revision.noteId,
      noteVersion: revision.noteVersion,
      bodyBefore: revision.bodyBefore,
      bodyAfter: revision.bodyAfter,
      editorId: revision.editorId,
      correlationId: revision.correlationId,
      recordedAt: recordedAt.toISOString(),
    };
  }
}
