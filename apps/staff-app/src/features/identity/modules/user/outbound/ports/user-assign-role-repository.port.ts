import { RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import {
  IUserAssignRoleStaffRoleRecord,
  IUserAssignRoleStaffUserRecord,
  IUserAssignRoleStaffUserRoleInsertQuery,
} from '../interfaces';

export interface IUserAssignRoleRepositoryPort {
  findById(id: string): Promise<Nullable<IUserAssignRoleStaffUserRecord>>;
  findRole(name: RoleEnum): Promise<Nullable<IUserAssignRoleStaffRoleRecord>>;
  insertUserRole(query: IUserAssignRoleStaffUserRoleInsertQuery): Promise<void>;
}

export const USER_ASSIGN_ROLE_REPOSITORY_PORT = Symbol('USER_ASSIGN_ROLE_REPOSITORY_PORT');
