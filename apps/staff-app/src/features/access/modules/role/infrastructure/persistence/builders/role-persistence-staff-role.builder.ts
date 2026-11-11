import { SelectQueryBuilder } from 'typeorm';

import { StaffRolePermission, type StaffRole } from '@acme-core/entities';

export class RolePersistenceStaffRoleBuilder extends SelectQueryBuilder<StaffRole> {
  private readonly staffRolePermissionAlias = StaffRolePermission.name;

  public forList(): this {
    this.selectRoleWithPermissions().orderBy(`${this.alias}.id`, 'ASC');

    return this;
  }

  public forById(id: string): this {
    this.selectRoleWithPermissions().where(`${this.alias}.id = :id`, { id });

    return this;
  }

  private selectRoleWithPermissions(): this {
    this.select([`${this.alias}.id`, `${this.alias}.name`])
      .leftJoin(`${this.alias}.rolePermissions`, this.staffRolePermissionAlias)
      .addSelect([
        `${this.staffRolePermissionAlias}.roleId`,
        `${this.staffRolePermissionAlias}.code`,
      ]);

    return this;
  }
}
