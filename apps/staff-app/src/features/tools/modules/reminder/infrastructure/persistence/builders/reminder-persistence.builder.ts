import { SelectQueryBuilder } from 'typeorm';

import { ReminderStatusEnum } from '@acme-libs/kernel';
import { Reminder } from '@acme-staff/common/entities';

import { IReminderAccessFindOwnedQuery, IReminderGetManyListQuery } from '../../../outbound';

export class ReminderPersistenceBuilder extends SelectQueryBuilder<Reminder> {
  public forOwned(query: IReminderAccessFindOwnedQuery): this {
    const { reminderId, ownerId } = query;

    this.selectReminder()
      .whereId(reminderId)
      .andWhere(`${this.alias}.ownerId = :ownerId`, { ownerId });

    return this;
  }

  public forInserted(reminderId: string): this {
    this.selectReminder().whereId(reminderId);

    return this;
  }

  public forList(query: IReminderGetManyListQuery): this {
    const { limit, offset, ownerId, status } = query;

    this.selectReminder().where(`${this.alias}.ownerId = :ownerId`, { ownerId });

    if (status !== undefined) {
      this.andWhere(`${this.alias}.status = :status`, { status });
    }

    this.orderBy(`${this.alias}.dueOn`, 'ASC')
      .addOrderBy(`${this.alias}.id`, 'ASC')
      .skip(offset)
      .take(limit);

    return this;
  }

  public forSummarize(ownerId: string): this {
    this.select('COUNT(*)', 'pending')
      .addSelect(`MIN(${this.alias}.dueOn)`, 'nextDueOn')
      .where(`${this.alias}.ownerId = :ownerId`, { ownerId })
      .andWhere(`${this.alias}.status = :status`, { status: ReminderStatusEnum.PENDING });

    return this;
  }

  public forById(reminderId: string): this {
    this.selectReminder().whereId(reminderId);

    return this;
  }

  private selectReminder(): this {
    this.select([
      `${this.alias}.id`,
      `${this.alias}.ownerId`,
      `${this.alias}.title`,
      `${this.alias}.body`,
      `${this.alias}.dueOn`,
      `${this.alias}.status`,
      `${this.alias}.version`,
      `${this.alias}.createdAt`,
      `${this.alias}.updatedAt`,
    ]);

    return this;
  }

  private whereId(reminderId: string): this {
    this.andWhere(`${this.alias}.id = :reminderId`, { reminderId });

    return this;
  }
}
