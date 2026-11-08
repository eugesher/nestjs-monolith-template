import { PermissionCodeEnum } from '@acme-libs/kernel';

import { IStaffAuthCoreSubjectRecordInput } from '../interfaces';

export class StaffAuthCoreSubjectModel {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roles: readonly string[],
    public readonly permissionCodes: readonly PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IStaffAuthCoreSubjectRecordInput): StaffAuthCoreSubjectModel {
    const { id, email, userRoles } = record;
    const roles = userRoles.map((userRole) => userRole.role.name).sort();
    const codes = userRoles.flatMap((userRole) =>
      userRole.role.rolePermissions.map(
        (rolePermission) => rolePermission.permission.code as PermissionCodeEnum,
      ),
    );
    const permissionCodes = [...new Set(codes)].sort();

    return new StaffAuthCoreSubjectModel(id, email, roles, permissionCodes);
  }
}
