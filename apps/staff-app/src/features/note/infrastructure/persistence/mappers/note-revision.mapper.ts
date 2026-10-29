import { NoteRevision } from '@acme-core/entities';
import { NoteRevisionModel } from '../../../domain';

export class NoteRevisionMapper {
  public static toModel(entity: NoteRevision): NoteRevisionModel {
    return NoteRevisionModel.reconstitute({
      id: entity.id,
      noteId: entity.noteId,
      noteVersion: entity.noteVersion,
      bodyBefore: entity.bodyBefore,
      bodyAfter: entity.bodyAfter,
      editorId: entity.editorId,
      correlationId: entity.correlationId,
      recordedAt: entity.recordedAt,
    });
  }
}
