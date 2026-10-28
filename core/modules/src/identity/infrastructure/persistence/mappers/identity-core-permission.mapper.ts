import { Permission } from '@acme-core/entities';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IdentityCorePermissionModel } from '../../../domain';

export class IdentityCorePermissionMapper {
  public static toModel(permission: Permission): IdentityCorePermissionModel {
    return IdentityCorePermissionModel.reconstitute({
      id: permission.id,
      code: permission.code as PermissionCodeEnum,
    });
  }
}
