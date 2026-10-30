import { StaffRole } from '@acme-core/entities';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IamRoleModel } from '../../../domain';

export class IamRoleMapper {
  public static toModel(role: StaffRole): IamRoleModel {
    const permissionCodes = role.rolePermissions
      .map((rolePermission) => rolePermission.permission.code as PermissionCodeEnum)
      .sort();

    return IamRoleModel.reconstitute({
      id: role.id,
      name: role.name as RoleEnum,
      permissionCodes,
    });
  }
}
