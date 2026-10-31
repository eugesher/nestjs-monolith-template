import { IdentityErrorCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { RoleDomainException } from '../exceptions/role-domain.exception';
import { IRoleRecord } from '../interfaces/role-record.interface';
import { RolePermissionModel } from './role-permission.model';

export class RoleModel {
  private constructor(
    public readonly id: number,
    public readonly name: RoleEnum,
    private codes: PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IRoleRecord): RoleModel {
    const { id, name, permissionCodes } = record;

    return new RoleModel(id, name, [...permissionCodes]);
  }

  public get permissionCodes(): readonly PermissionCodeEnum[] {
    return this.codes;
  }

  public replacePermissions(requested: PermissionCodeEnum[], known: RolePermissionModel[]): void {
    const knownCodes = new Set(known.map((permission) => permission.code));
    const unique = [...new Set(requested)];
    const unknown = unique.filter((code) => !knownCodes.has(code));

    if (unknown.length > 0) {
      throw new RoleDomainException(
        IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND,
        `Unknown permission codes: ${unknown.join(', ')}`,
      );
    }

    this.codes = unique;
  }
}
