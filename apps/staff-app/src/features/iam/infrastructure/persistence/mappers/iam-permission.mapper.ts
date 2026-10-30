import { StaffPermission } from '@acme-core/entities';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IamPermissionModel } from '../../../domain';

export class IamPermissionMapper {
  public static toModel(permission: StaffPermission): IamPermissionModel {
    return IamPermissionModel.reconstitute({
      id: permission.id,
      code: permission.code as PermissionCodeEnum,
    });
  }
}
