import { IdentityErrorCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreException } from '../exceptions/staff-identity-core.exception';
import { IStaffIdentityCoreRoleRecord } from '../interfaces/staff-identity-core-role-record.interface';
import { StaffIdentityCorePermissionModel } from './staff-identity-core-permission.model';

export class StaffIdentityCoreRoleModel {
  private constructor(
    public readonly id: number,
    public readonly name: RoleEnum,
    private codes: PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IStaffIdentityCoreRoleRecord): StaffIdentityCoreRoleModel {
    const { id, name, permissionCodes } = record;

    return new StaffIdentityCoreRoleModel(id, name, [...permissionCodes]);
  }

  public get permissionCodes(): readonly PermissionCodeEnum[] {
    return this.codes;
  }

  public replacePermissions(
    requested: PermissionCodeEnum[],
    known: StaffIdentityCorePermissionModel[],
  ): void {
    const knownCodes = new Set(known.map((permission) => permission.code));
    const unique = [...new Set(requested)];
    const unknown = unique.filter((code) => !knownCodes.has(code));

    if (unknown.length > 0) {
      throw new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND,
        `Unknown permission codes: ${unknown.join(', ')}`,
      );
    }

    this.codes = unique;
  }
}
