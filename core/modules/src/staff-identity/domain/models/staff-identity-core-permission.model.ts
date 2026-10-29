import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IStaffIdentityCorePermissionRecord } from '../interfaces/staff-identity-core-permission-record.interface';

export class StaffIdentityCorePermissionModel {
  private constructor(
    public readonly id: number,
    public readonly code: PermissionCodeEnum,
  ) {}

  public static reconstitute(
    record: IStaffIdentityCorePermissionRecord,
  ): StaffIdentityCorePermissionModel {
    const { id, code } = record;

    return new StaffIdentityCorePermissionModel(id, code);
  }
}
