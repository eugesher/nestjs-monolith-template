import { IdentityErrorCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IdentityCoreException } from '../exceptions/identity-core.exception';
import { IIdentityCoreRoleRecord } from '../interfaces/identity-core-role-record.interface';
import { IdentityCorePermissionModel } from './identity-core-permission.model';

export class IdentityCoreRoleModel {
  private constructor(
    public readonly id: number,
    public readonly name: RoleEnum,
    private codes: PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IIdentityCoreRoleRecord): IdentityCoreRoleModel {
    const { id, name, permissionCodes } = record;

    return new IdentityCoreRoleModel(id, name, [...permissionCodes]);
  }

  public get permissionCodes(): readonly PermissionCodeEnum[] {
    return this.codes;
  }

  public replacePermissions(
    requested: PermissionCodeEnum[],
    known: IdentityCorePermissionModel[],
  ): void {
    const knownCodes = new Set(known.map((permission) => permission.code));
    const unique = [...new Set(requested)];
    const unknown = unique.filter((code) => !knownCodes.has(code));

    if (unknown.length > 0) {
      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND,
        `Unknown permission codes: ${unknown.join(', ')}`,
      );
    }

    this.codes = unique;
  }
}
