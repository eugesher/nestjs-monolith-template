import { StaffRole } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreRoleModel } from '../../../domain';

export class StaffIdentityCoreRoleMapper {
  public static toModel(role: StaffRole): StaffIdentityCoreRoleModel {
    const permissionCodes = role.rolePermissions
      .map((rolePermission) => rolePermission.permission.code as PermissionCodeEnum)
      .sort();

    return StaffIdentityCoreRoleModel.reconstitute({
      id: role.id,
      name: role.name as RoleEnum,
      permissionCodes,
    });
  }
}
