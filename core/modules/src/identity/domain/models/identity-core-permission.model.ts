import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IIdentityCorePermissionRecord } from '../interfaces/identity-core-permission-record.interface';

export class IdentityCorePermissionModel {
  private constructor(
    public readonly id: number,
    public readonly code: PermissionCodeEnum,
  ) {}

  public static reconstitute(record: IIdentityCorePermissionRecord): IdentityCorePermissionModel {
    const { id, code } = record;

    return new IdentityCorePermissionModel(id, code);
  }
}
