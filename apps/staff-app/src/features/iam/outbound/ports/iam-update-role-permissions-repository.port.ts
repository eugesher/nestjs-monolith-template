import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IamPermissionModel, IamRoleModel } from '../../domain';

export interface IIamUpdateRolePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Maybe<IamRoleModel>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<IamPermissionModel[]>;
  replacePermissions(role: IamRoleModel): Promise<void>;
}

export const IAM_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'IAM_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT',
);
