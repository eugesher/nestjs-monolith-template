import { IdentityErrorCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonException } from '../exceptions/staff-identity-common.exception';
import { IStaffIdentityCommonRoleRecord } from '../interfaces/staff-identity-common-role-record.interface';
import { StaffIdentityCommonPermissionModel } from './staff-identity-common-permission.model';

export class StaffIdentityCommonRoleModel {
  private constructor(
    public readonly id: number,
    public readonly name: RoleEnum,
    private codes: PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IStaffIdentityCommonRoleRecord): StaffIdentityCommonRoleModel {
    const { id, name, permissionCodes } = record;

    return new StaffIdentityCommonRoleModel(id, name, [...permissionCodes]);
  }

  public get permissionCodes(): readonly PermissionCodeEnum[] {
    return this.codes;
  }

  public replacePermissions(
    requested: PermissionCodeEnum[],
    known: StaffIdentityCommonPermissionModel[],
  ): void {
    const knownCodes = new Set(known.map((permission) => permission.code));
    const unique = [...new Set(requested)];
    const unknown = unique.filter((code) => !knownCodes.has(code));

    if (unknown.length > 0) {
      throw new StaffIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND,
        `Unknown permission codes: ${unknown.join(', ')}`,
      );
    }

    this.codes = unique;
  }
}
