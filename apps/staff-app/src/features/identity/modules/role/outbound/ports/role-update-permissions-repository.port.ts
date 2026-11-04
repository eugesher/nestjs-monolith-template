import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import {
  IRoleFoundRecord,
  IRolePermissionFoundRecord,
  IRolePermissionInsertQuery,
} from '../interfaces';

export interface IRoleUpdatePermissionsRepositoryPort {
  findRole(name: RoleEnum): Promise<Nullable<IRoleFoundRecord>>;
  findPermissions(codes: PermissionCodeEnum[]): Promise<IRolePermissionFoundRecord[]>;
  deleteRolePermissions(roleId: string): Promise<void>;
  insertRolePermissions(queries: IRolePermissionInsertQuery[]): Promise<void>;
}

export const ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT',
);
