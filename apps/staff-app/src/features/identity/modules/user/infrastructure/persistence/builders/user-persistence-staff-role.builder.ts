import { SelectQueryBuilder } from 'typeorm';

import { RoleEnum } from '@acme-libs/kernel';
import { StaffRole } from '@acme-core/entities';

export class UserPersistenceStaffRoleBuilder extends SelectQueryBuilder<StaffRole> {
  public forRole(name: RoleEnum): this {
    this.selectRole().where(`${this.alias}.name = :name`, { name });

    return this;
  }

  public forRoles(names: RoleEnum[]): this {
    this.selectRole().where(`${this.alias}.name IN (:...names)`, { names });

    return this;
  }

  private selectRole(): this {
    this.select([`${this.alias}.id`]);

    return this;
  }
}
