import { SelectQueryBuilder } from 'typeorm';

import { StaffRole } from '@acme-core/entities';

export class UserPersistenceStaffRoleBuilder extends SelectQueryBuilder<StaffRole> {
  public forRole(name: string): this {
    this.selectRole().where(`${this.alias}.name = :name`, { name });

    return this;
  }

  public forRoles(names: string[]): this {
    this.select([`${this.alias}.id`, `${this.alias}.name`]).where(
      `${this.alias}.name IN (:...names)`,
      {
        names,
      },
    );

    return this;
  }

  private selectRole(): this {
    this.select([`${this.alias}.id`]);

    return this;
  }
}
