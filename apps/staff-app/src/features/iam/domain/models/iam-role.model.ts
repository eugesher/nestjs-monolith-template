import { IdentityErrorCodeEnum, PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { IamDomainException } from '../exceptions/iam-domain.exception';
import { IIamRoleRecord } from '../interfaces/iam-role-record.interface';
import { IamPermissionModel } from './iam-permission.model';

export class IamRoleModel {
  private constructor(
    public readonly id: number,
    public readonly name: RoleEnum,
    private codes: PermissionCodeEnum[],
  ) {}

  public static reconstitute(record: IIamRoleRecord): IamRoleModel {
    const { id, name, permissionCodes } = record;

    return new IamRoleModel(id, name, [...permissionCodes]);
  }

  public get permissionCodes(): readonly PermissionCodeEnum[] {
    return this.codes;
  }

  public replacePermissions(requested: PermissionCodeEnum[], known: IamPermissionModel[]): void {
    const knownCodes = new Set(known.map((permission) => permission.code));
    const unique = [...new Set(requested)];
    const unknown = unique.filter((code) => !knownCodes.has(code));

    if (unknown.length > 0) {
      throw new IamDomainException(
        IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND,
        `Unknown permission codes: ${unknown.join(', ')}`,
      );
    }

    this.codes = unique;
  }
}
