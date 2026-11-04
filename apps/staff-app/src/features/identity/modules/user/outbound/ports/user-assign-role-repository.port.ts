import { RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import {
  IUserStaffRoleFoundRecord,
  IUserStaffUserFoundRecord,
  IUserStaffUserRoleInsertQuery,
} from '../interfaces';

export interface IUserAssignRoleRepositoryPort {
  findById(id: string): Promise<Nullable<IUserStaffUserFoundRecord>>;
  findRole(name: RoleEnum): Promise<Nullable<IUserStaffRoleFoundRecord>>;
  insertUserRole(query: IUserStaffUserRoleInsertQuery): Promise<void>;
}

export const USER_ASSIGN_ROLE_REPOSITORY_PORT = Symbol('USER_ASSIGN_ROLE_REPOSITORY_PORT');
