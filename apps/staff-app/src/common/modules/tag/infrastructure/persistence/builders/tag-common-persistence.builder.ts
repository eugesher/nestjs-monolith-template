import { SelectQueryBuilder } from 'typeorm';

import { SubjectTag, type Tag } from '@acme-staff/common/entities';

import type { ITagCommonFindQuery } from '../../../outbound';

export class TagCommonPersistenceBuilder extends SelectQueryBuilder<Tag> {
  private readonly subjectTagAlias = SubjectTag.name;

  public forList(query: ITagCommonFindQuery): this {
    const { subjectType, subjectId } = query;

    this.selectTag()
      .innerJoin(
        SubjectTag,
        this.subjectTagAlias,
        `${this.subjectTagAlias}.tagId = ${this.alias}.id`,
      )
      .where(`${this.subjectTagAlias}.subjectType = :subjectType`, { subjectType })
      .andWhere(`${this.subjectTagAlias}.subjectId = :subjectId`, { subjectId })
      .orderBy(`${this.alias}.name`, 'ASC');

    return this;
  }

  public forLockTags(tagIds: string[]): this {
    this.selectTag()
      .where(`${this.alias}.id IN (:...tagIds)`, { tagIds })
      .orderBy(`${this.alias}.name`, 'ASC')
      .setLock('pessimistic_read');

    return this;
  }

  private selectTag(): this {
    this.select([`${this.alias}.id`, `${this.alias}.name`]);

    return this;
  }
}
