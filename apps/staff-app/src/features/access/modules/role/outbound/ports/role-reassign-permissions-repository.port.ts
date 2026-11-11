import type { Nullable } from '@acme-libs/toolkit';

import type {
  IRoleReassignPermissionsRolePermissionInsertQuery,
  IRoleReassignPermissionsRoleRecord,
} from '../interfaces';

export interface IRoleReassignPermissionsRepositoryPort {
  findRole(id: string): Promise<Nullable<IRoleReassignPermissionsRoleRecord>>;
  deleteRolePermissions(roleId: string): Promise<void>;
  insertRolePermissions(
    queries: IRoleReassignPermissionsRolePermissionInsertQuery[],
  ): Promise<void>;
}

export const ROLE_REASSIGN_PERMISSIONS_REPOSITORY_PORT = Symbol(
  'ROLE_REASSIGN_PERMISSIONS_REPOSITORY_PORT',
);
