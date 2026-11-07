import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import {
  IRoleUpdatePermissionsPermissionRecord,
  IRoleUpdatePermissionsRolePermissionInsertQuery,
  IRoleUpdatePermissionsRoleRecord,
} from '../interfaces';

export interface IRoleUpdatePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Nullable<IRoleUpdatePermissionsRoleRecord>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<IRoleUpdatePermissionsPermissionRecord[]>;
  deleteRolePermissions(roleId: string): Promise<void>;
  insertRolePermissions(queries: IRoleUpdatePermissionsRolePermissionInsertQuery[]): Promise<void>;
}

export const ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT',
);
