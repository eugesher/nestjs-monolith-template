import { SelectQueryBuilder } from 'typeorm';

import { Note } from '@acme-staff/common/entities';

import { INoteAccessFindOwnedQuery, INoteGetManyListQuery } from '../../../outbound';

export class NotePersistenceBuilder extends SelectQueryBuilder<Note> {
  public forOwned(query: INoteAccessFindOwnedQuery): this {
    const { noteId, authorId } = query;

    this.selectNote()
      .where(`${this.alias}.id = :noteId`, { noteId })
      .andWhere(`${this.alias}.authorId = :authorId`, { authorId });

    return this;
  }

  public forInserted(noteId: string): this {
    this.selectNote().where(`${this.alias}.id = :noteId`, { noteId });

    return this;
  }

  public forList(query: INoteGetManyListQuery): this {
    const { limit, offset, subjectType, subjectId, resolved, authorId } = query;

    this.selectNote().where(`${this.alias}.authorId = :authorId`, { authorId });

    if (subjectType !== undefined) {
      this.andWhere(`${this.alias}.subjectType = :subjectType`, { subjectType }).andWhere(
        `${this.alias}.subjectId = :subjectId`,
        { subjectId },
      );
    }

    if (resolved !== undefined) {
      this.andWhere(`${this.alias}.resolved = :resolved`, { resolved });
    }

    this.orderBy(`${this.alias}.id`, 'DESC').skip(offset).take(limit);

    return this;
  }

  private selectNote(): this {
    this.select([
      `${this.alias}.id`,
      `${this.alias}.subjectType`,
      `${this.alias}.subjectId`,
      `${this.alias}.body`,
      `${this.alias}.authorId`,
      `${this.alias}.resolved`,
      `${this.alias}.version`,
      `${this.alias}.createdAt`,
      `${this.alias}.updatedAt`,
    ]);

    return this;
  }
}
