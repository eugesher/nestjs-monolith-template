import { SelectQueryBuilder } from 'typeorm';

import { SubjectTag } from '@acme-staff/common/entities';

import { ITagCommonFindSubjectIdsQuery, ITagCommonReplaceFindLinkedQuery } from '../../../outbound';

export class TagCommonPersistenceSubjectTagBuilder extends SelectQueryBuilder<SubjectTag> {
  public forList(query: ITagCommonFindSubjectIdsQuery): this {
    const { subjectType, tagId } = query;

    this.select([`${this.alias}.id`, `${this.alias}.subjectId`])
      .where(`${this.alias}.tagId = :tagId`, { tagId })
      .andWhere(`${this.alias}.subjectType = :subjectType`, { subjectType });

    return this;
  }

  public forLinked(query: ITagCommonReplaceFindLinkedQuery): this {
    const { subjectType, subjectId } = query;

    this.select([`${this.alias}.id`, `${this.alias}.tagId`])
      .where(`${this.alias}.subjectType = :subjectType`, { subjectType })
      .andWhere(`${this.alias}.subjectId = :subjectId`, { subjectId });

    return this;
  }
}
