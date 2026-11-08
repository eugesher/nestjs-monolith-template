import { SelectQueryBuilder } from 'typeorm';

import { StaffRole } from '@acme-core/entities';

export class UserPersistenceStaffRoleBuilder extends SelectQueryBuilder<StaffRole> {
  public forById(id: string): this {
    this.select([`${this.alias}.id`, `${this.alias}.name`]).where(`${this.alias}.id = :id`, { id });

    return this;
  }

  public forByIds(ids: string[]): this {
    this.select([`${this.alias}.id`]).where(`${this.alias}.id IN (:...ids)`, { ids });

    return this;
  }
}
