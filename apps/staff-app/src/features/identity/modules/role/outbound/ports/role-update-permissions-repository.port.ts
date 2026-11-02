import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import { RolePermissionModel, RoleModel } from '../../domain';
import { IRoleReplacePermissionsCommand } from '../interfaces';

export interface IRoleUpdatePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Nullable<RoleModel>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<RolePermissionModel[]>;
  replacePermissions(command: IRoleReplacePermissionsCommand): Promise<void>;
}

export const ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT',
);
