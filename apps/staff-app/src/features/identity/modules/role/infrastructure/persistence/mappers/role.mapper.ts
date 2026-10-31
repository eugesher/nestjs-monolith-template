import { StaffRole } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { RoleModel } from '../../../domain';

export class RoleMapper {
  public static toModel(role: StaffRole): RoleModel {
    const permissionCodes = role.rolePermissions
      .map((rolePermission) => rolePermission.permission.code as PermissionCodeEnum)
      .sort();

    return RoleModel.reconstitute({
      id: role.id,
      name: role.name as RoleEnum,
      permissionCodes,
    });
  }
}
