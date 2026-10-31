import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { RolePermissionModel, RoleModel } from '../../domain';

export interface IRoleUpdatePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Maybe<RoleModel>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<RolePermissionModel[]>;
  replacePermissions(role: RoleModel): Promise<void>;
}

export const ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT',
);
