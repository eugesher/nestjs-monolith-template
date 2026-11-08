import { PermissionCodeEnum } from '@acme-libs/kernel';

import { IRolePermissionRecordInput } from '../interfaces';

export class RolePermissionModel {
  private constructor(
    public readonly id: string,
    public readonly code: PermissionCodeEnum,
  ) {}

  public static reconstitute(record: IRolePermissionRecordInput): RolePermissionModel {
    const { id, code } = record;

    return new RolePermissionModel(id, code as PermissionCodeEnum);
  }
}
