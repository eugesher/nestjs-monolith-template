import { RoleEnum } from '@acme-libs/kernel';

import { IAuthCommonStaffUserRecord } from '../interfaces/auth-common-staff-user-record.interface';

export class AuthCommonStaffUserModel {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roles: readonly RoleEnum[],
  ) {}

  public static reconstitute(record: IAuthCommonStaffUserRecord): AuthCommonStaffUserModel {
    const { id, email, userRoles } = record;
    const roles = userRoles.map((userRole) => userRole.role.name as RoleEnum).sort();

    return new AuthCommonStaffUserModel(id, email, roles);
  }
}
