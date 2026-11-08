import { Nullable } from '@acme-libs/toolkit';

import {
  IRoleUpdatePermissionsRolePermissionInsertQuery,
  IRoleUpdatePermissionsRoleRecord,
} from '../interfaces';

export interface IRoleUpdatePermissionsRepositoryPort {
  findRole(id: string): Promise<Nullable<IRoleUpdatePermissionsRoleRecord>>;
  deleteRolePermissions(roleId: string): Promise<void>;
  insertRolePermissions(queries: IRoleUpdatePermissionsRolePermissionInsertQuery[]): Promise<void>;
}

export const ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT',
);
