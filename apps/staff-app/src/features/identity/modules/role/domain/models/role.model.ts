import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

import { AuthPermissionNotFoundException } from '../exceptions/auth-permission-not-found.exception';
import { IRoleRecordInput } from '../interfaces/inputs/role-record.input';
import { IRoleSnapshotOutput } from '../interfaces/outputs/role-snapshot.output';
import { RolePermissionModel } from './role-permission.model';

export class RoleModel {
  public get permissionCodes(): readonly PermissionCodeEnum[] {
    return this.codes;
  }

  private constructor(
    public readonly id: string,
    public readonly name: RoleEnum,
    private codes: PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IRoleRecordInput): RoleModel {
    const { id, name, rolePermissions } = record;
    const permissionCodes = rolePermissions
      .map((rolePermission) => rolePermission.permission.code as PermissionCodeEnum)
      .sort();

    return new RoleModel(id, name as RoleEnum, permissionCodes);
  }

  public replacePermissions(requested: PermissionCodeEnum[], known: RolePermissionModel[]): void {
    const knownCodes = new Set(known.map((permission) => permission.code));
    const unique = [...new Set(requested)];
    const unknown = unique.filter((code) => !knownCodes.has(code));

    if (unknown.length > 0) {
      throw new AuthPermissionNotFoundException(unknown);
    }

    this.codes = unique;
  }

  public toSnapshot(): IRoleSnapshotOutput {
    return { name: this.name, permissionCodes: [...this.permissionCodes] };
  }
}
