import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IIamPermissionRecord } from '../interfaces/iam-permission-record.interface';

export class IamPermissionModel {
  private constructor(
    public readonly id: number,
    public readonly code: PermissionCodeEnum,
  ) {}

  public static reconstitute(record: IIamPermissionRecord): IamPermissionModel {
    const { id, code } = record;

    return new IamPermissionModel(id, code);
  }
}
