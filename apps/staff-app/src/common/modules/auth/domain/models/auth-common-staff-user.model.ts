import { RoleEnum } from '@acme-libs/kernel';
import { IAuthCommonStaffUserRecord } from '../interfaces/auth-common-staff-user-record.interface';

export class AuthCommonStaffUserModel {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roles: readonly RoleEnum[],
  ) {}

  public static reconstitute(record: IAuthCommonStaffUserRecord): AuthCommonStaffUserModel {
    const { id, email, roles } = record;

    return new AuthCommonStaffUserModel(id, email, [...roles]);
  }
}
