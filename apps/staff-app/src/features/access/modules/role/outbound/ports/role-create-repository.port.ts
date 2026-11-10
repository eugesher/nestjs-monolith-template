import {
  IRoleCreateRolePermissionInsertQuery,
  IRoleCreateStaffRoleInsertQuery,
  IRoleCreateStaffRoleInsertRecord,
} from '../interfaces';

export interface IRoleCreateRepositoryPort {
  insertRole(query: IRoleCreateStaffRoleInsertQuery): Promise<IRoleCreateStaffRoleInsertRecord>;
  insertRolePermissions(queries: IRoleCreateRolePermissionInsertQuery[]): Promise<void>;
}

export const ROLE_CREATE_REPOSITORY_PORT = Symbol('ROLE_CREATE_REPOSITORY_PORT');
