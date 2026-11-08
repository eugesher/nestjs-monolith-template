import { IUserReassignRolesStaffUserRoleInsertQuery } from '../interfaces';

export interface IUserReassignRolesRepositoryPort {
  deleteUserRolesExcept(userId: string, roleIds: string[]): Promise<void>;
  insertUserRolesIgnore(queries: IUserReassignRolesStaffUserRoleInsertQuery[]): Promise<void>;
}

export const USER_REASSIGN_ROLES_REPOSITORY_PORT = Symbol('USER_REASSIGN_ROLES_REPOSITORY_PORT');
