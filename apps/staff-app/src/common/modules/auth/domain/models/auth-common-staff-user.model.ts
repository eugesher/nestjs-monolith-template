import { RoleEnum, UserStatusEnum } from '@acme-libs/kernel';
import { IAuthCommonStaffUserRecord } from '../interfaces/auth-common-staff-user-record.interface';

export class AuthCommonStaffUserModel {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly status: UserStatusEnum,
    public readonly roles: readonly RoleEnum[],
  ) {}

  public static reconstitute(record: IAuthCommonStaffUserRecord): AuthCommonStaffUserModel {
    const { id, email, status, roles } = record;

    return new AuthCommonStaffUserModel(id, email, status, [...roles]);
  }

  public get isActive(): boolean {
    return this.status === UserStatusEnum.ACTIVE;
  }
}
