import { SelectQueryBuilder } from 'typeorm';

import { UserStatusEnum } from '@acme-libs/kernel';
import {
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
} from '@acme-core/entities';

export class StaffAuthCorePersistenceStaffUserBuilder extends SelectQueryBuilder<StaffUser> {
  private readonly staffUserRoleAlias = StaffUserRole.name;
  private readonly staffRoleAlias = StaffRole.name;
  private readonly staffRolePermissionAlias = StaffRolePermission.name;
  private readonly staffPermissionAlias = StaffPermission.name;

  public forByEmail(email: string): this {
    this.select([`${this.alias}.id`, `${this.alias}.passwordHash`, `${this.alias}.status`]).where(
      `${this.alias}.email = :email`,
      { email },
    );

    return this;
  }

  public forActiveById(id: string): this {
    this.select([`${this.alias}.id`, `${this.alias}.email`])
      .leftJoin(`${this.alias}.userRoles`, this.staffUserRoleAlias)
      .addSelect([`${this.staffUserRoleAlias}.userId`, `${this.staffUserRoleAlias}.roleId`])
      .leftJoin(`${this.staffUserRoleAlias}.role`, this.staffRoleAlias)
      .addSelect([`${this.staffRoleAlias}.id`, `${this.staffRoleAlias}.name`])
      .leftJoin(`${this.staffRoleAlias}.rolePermissions`, this.staffRolePermissionAlias)
      .addSelect([
        `${this.staffRolePermissionAlias}.roleId`,
        `${this.staffRolePermissionAlias}.permissionId`,
      ])
      .leftJoin(`${this.staffRolePermissionAlias}.permission`, this.staffPermissionAlias)
      .addSelect([`${this.staffPermissionAlias}.id`, `${this.staffPermissionAlias}.code`])
      .where(`${this.alias}.id = :id`, { id })
      .andWhere(`${this.alias}.status = :status`, { status: UserStatusEnum.ACTIVE });

    return this;
  }
}
