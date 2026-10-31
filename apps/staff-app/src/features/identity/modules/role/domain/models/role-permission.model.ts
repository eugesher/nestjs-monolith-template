import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IRolePermissionRecord } from '../interfaces/role-permission-record.interface';

export class RolePermissionModel {
  private constructor(
    public readonly id: number,
    public readonly code: PermissionCodeEnum,
  ) {}

  public static reconstitute(record: IRolePermissionRecord): RolePermissionModel {
    const { id, code } = record;

    return new RolePermissionModel(id, code);
  }
}
