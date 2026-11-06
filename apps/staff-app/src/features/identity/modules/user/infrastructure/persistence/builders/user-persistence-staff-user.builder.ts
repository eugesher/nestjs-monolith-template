import { SelectQueryBuilder } from 'typeorm';

import { StaffRole, StaffUser, StaffUserRole } from '@acme-core/entities';

export class UserPersistenceStaffUserBuilder extends SelectQueryBuilder<StaffUser> {
  private readonly staffUserRoleAlias = StaffUserRole.name;
  private readonly staffRoleAlias = StaffRole.name;

  public forById(id: string): this {
    this.select([`${this.alias}.id`])
      .leftJoin(`${this.alias}.userRoles`, this.staffUserRoleAlias)
      .addSelect([`${this.staffUserRoleAlias}.userId`, `${this.staffUserRoleAlias}.roleId`])
      .leftJoin(`${this.staffUserRoleAlias}.role`, this.staffRoleAlias)
      .addSelect([`${this.staffRoleAlias}.id`, `${this.staffRoleAlias}.name`])
      .where(`${this.alias}.id = :id`, { id });

    return this;
  }
}
