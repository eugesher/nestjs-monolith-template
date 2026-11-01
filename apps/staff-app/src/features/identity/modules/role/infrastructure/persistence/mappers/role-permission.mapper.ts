import { PermissionCodeEnum } from '@acme-libs-kernel';

import { StaffPermission } from '@acme-core-entities';

import { RolePermissionModel } from '../../../domain';

export class RolePermissionMapper {
  public static toModel(permission: StaffPermission): RolePermissionModel {
    return RolePermissionModel.reconstitute({
      id: permission.id,
      code: permission.code as PermissionCodeEnum,
    });
  }
}
