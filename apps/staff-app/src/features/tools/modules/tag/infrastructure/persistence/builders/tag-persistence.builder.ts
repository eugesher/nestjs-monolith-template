import { SelectQueryBuilder } from 'typeorm';

import { Tag } from '@acme-staff/common/entities';

import { ITagGetManyQuery } from '../../../outbound';

export class TagPersistenceBuilder extends SelectQueryBuilder<Tag> {
  public forById(tagId: string): this {
    this.selectTag().where(`${this.alias}.id = :tagId`, { tagId });

    return this;
  }

  public forInserted(tagId: string): this {
    this.selectTag().where(`${this.alias}.id = :tagId`, { tagId });

    return this;
  }

  public forList(query: ITagGetManyQuery): this {
    const { limit, offset } = query;

    this.selectTag()
      .orderBy(`${this.alias}.name`, 'ASC')
      .addOrderBy(`${this.alias}.id`, 'ASC')
      .skip(offset)
      .take(limit);

    return this;
  }

  private selectTag(): this {
    this.select([
      `${this.alias}.id`,
      `${this.alias}.name`,
      `${this.alias}.createdAt`,
      `${this.alias}.updatedAt`,
    ]);

    return this;
  }
}
