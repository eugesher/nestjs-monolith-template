import { Note } from '@acme-core/entities';
import { NoteModel } from '../../../domain';

export class NoteMapper {
  public static toModel(entity: Note): NoteModel {
    return NoteModel.reconstitute({
      id: entity.id,
      subjectType: entity.subjectType,
      subjectId: entity.subjectId,
      body: entity.body,
      authorId: entity.authorId,
      resolved: entity.resolved,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
