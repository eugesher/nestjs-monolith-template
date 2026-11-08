import { SelectQueryBuilder } from 'typeorm';

import { StaffRole } from '@acme-core/entities';

export class UserPersistenceStaffRoleBuilder extends SelectQueryBuilder<StaffRole> {
  public forByIds(ids: string[]): this {
    this.select([`${this.alias}.id`]).where(`${this.alias}.id IN (:...ids)`, { ids });

    return this;
  }
}
