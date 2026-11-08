import {
  IRoleCreateRolePermissionInsertQuery,
  IRoleCreateStaffRoleInsertQuery,
} from '../interfaces';

export interface IRoleCreateRepositoryPort {
  insertRole(query: IRoleCreateStaffRoleInsertQuery): Promise<string>;
  insertRolePermissions(queries: IRoleCreateRolePermissionInsertQuery[]): Promise<void>;
}

export const ROLE_CREATE_REPOSITORY_PORT = Symbol('ROLE_CREATE_REPOSITORY_PORT');
