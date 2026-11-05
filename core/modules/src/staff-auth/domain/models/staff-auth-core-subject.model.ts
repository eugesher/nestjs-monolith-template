import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

import { IStaffAuthCoreSubjectRecord } from '../interfaces/staff-auth-core-subject-record.interface';

export class StaffAuthCoreSubjectModel {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roles: readonly RoleEnum[],
    public readonly permissionCodes: readonly PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IStaffAuthCoreSubjectRecord): StaffAuthCoreSubjectModel {
    const { id, email, userRoles } = record;
    const roles = userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();
    const codes = userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.code as PermissionCodeEnum,
      ),
    );
    const permissionCodes = [...new Set(codes)].sort();

    return new StaffAuthCoreSubjectModel(id, email, roles, permissionCodes);
  }
}
