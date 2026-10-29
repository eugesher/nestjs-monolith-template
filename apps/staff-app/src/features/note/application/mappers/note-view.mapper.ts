import { NoteModel } from '../../domain';
import { INoteView } from '../interfaces/views/note.view';

export class NoteViewMapper {
  public static toView(note: NoteModel): INoteView {
    const now = new Date();
    const createdAt = note.createdAt ?? now;
    const updatedAt = note.updatedAt ?? now;

    return {
      id: note.id ?? '',
      subjectType: note.subjectType,
      subjectId: note.subjectId,
      body: note.body,
      authorId: note.authorId,
      resolved: note.resolved,
      version: note.version,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
