import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IdentityCorePermissionModel, IdentityCoreRoleModel } from '../../domain';

export interface IIdentityCoreUpdateRolePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Maybe<IdentityCoreRoleModel>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<IdentityCorePermissionModel[]>;
  replacePermissions(role: IdentityCoreRoleModel): Promise<void>;
}

export const IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT',
);
