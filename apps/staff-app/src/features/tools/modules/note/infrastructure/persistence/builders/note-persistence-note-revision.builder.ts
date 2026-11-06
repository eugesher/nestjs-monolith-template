import { SelectQueryBuilder } from 'typeorm';

import { NoteRevision } from '@acme-staff/common/entities';

import { INoteGetRevisionsListForNoteQuery } from '../../../outbound';

export class NotePersistenceNoteRevisionBuilder extends SelectQueryBuilder<NoteRevision> {
  public forListForNote(query: INoteGetRevisionsListForNoteQuery): this {
    const { limit, offset, noteId } = query;

    this.select([
      `${this.alias}.id`,
      `${this.alias}.noteId`,
      `${this.alias}.noteVersion`,
      `${this.alias}.bodyBefore`,
      `${this.alias}.bodyAfter`,
      `${this.alias}.editorId`,
      `${this.alias}.correlationId`,
      `${this.alias}.recordedAt`,
    ])
      .where(`${this.alias}.noteId = :noteId`, { noteId })
      .orderBy(`${this.alias}.noteVersion`, 'DESC')
      .skip(offset)
      .take(limit);

    return this;
  }
}
