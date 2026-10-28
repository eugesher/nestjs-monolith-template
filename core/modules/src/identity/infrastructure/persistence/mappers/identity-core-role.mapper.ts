import { Role } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IdentityCoreRoleModel } from '../../../domain';

export class IdentityCoreRoleMapper {
  public static toModel(role: Role): IdentityCoreRoleModel {
    const permissionCodes = role.rolePermissions
      .map((rolePermission) => rolePermission.permission.code as PermissionCodeEnum)
      .sort();

    return IdentityCoreRoleModel.reconstitute({
      id: role.id,
      name: role.name as RoleEnum,
      permissionCodes,
    });
  }
}
