import { StaffRole } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonRoleModel } from '../../../domain';

export class StaffIdentityCommonRoleMapper {
  public static toModel(role: StaffRole): StaffIdentityCommonRoleModel {
    const permissionCodes = role.rolePermissions
      .map((rolePermission) => rolePermission.permission.code as PermissionCodeEnum)
      .sort();

    return StaffIdentityCommonRoleModel.reconstitute({
      id: role.id,
      name: role.name as RoleEnum,
      permissionCodes,
    });
  }
}
