import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IStaffIdentityCommonPermissionRecord } from '../interfaces/staff-identity-common-permission-record.interface';

export class StaffIdentityCommonPermissionModel {
  private constructor(
    public readonly id: number,
    public readonly code: PermissionCodeEnum,
  ) {}

  public static reconstitute(
    record: IStaffIdentityCommonPermissionRecord,
  ): StaffIdentityCommonPermissionModel {
    const { id, code } = record;

    return new StaffIdentityCommonPermissionModel(id, code);
  }
}
