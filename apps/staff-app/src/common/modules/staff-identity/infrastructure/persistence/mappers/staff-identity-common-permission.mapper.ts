import { StaffPermission } from '@acme-core/entities';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonPermissionModel } from '../../../domain';

export class StaffIdentityCommonPermissionMapper {
  public static toModel(permission: StaffPermission): StaffIdentityCommonPermissionModel {
    return StaffIdentityCommonPermissionModel.reconstitute({
      id: permission.id,
      code: permission.code as PermissionCodeEnum,
    });
  }
}
