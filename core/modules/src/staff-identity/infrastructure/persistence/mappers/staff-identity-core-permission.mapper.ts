import { StaffPermission } from '@acme-core/entities';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCorePermissionModel } from '../../../domain';

export class StaffIdentityCorePermissionMapper {
  public static toModel(permission: StaffPermission): StaffIdentityCorePermissionModel {
    return StaffIdentityCorePermissionModel.reconstitute({
      id: permission.id,
      code: permission.code as PermissionCodeEnum,
    });
  }
}
