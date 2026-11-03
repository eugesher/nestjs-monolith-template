import { RoleEnum } from '@acme-libs/kernel';
import { Nullable } from '@acme-libs/toolkit';

import {
  IUserStaffRoleFoundRecord,
  IUserStaffUserFoundRecord,
  IUserStaffUserRoleInsertCommand,
} from '../interfaces';

export interface IUserAssignRoleRepositoryPort {
  findById(id: string): Promise<Nullable<IUserStaffUserFoundRecord>>;
  findRole(name: RoleEnum): Promise<Nullable<IUserStaffRoleFoundRecord>>;
  insertUserRole(command: IUserStaffUserRoleInsertCommand): Promise<void>;
}

export const USER_ASSIGN_ROLE_REPOSITORY_PORT = Symbol('USER_ASSIGN_ROLE_REPOSITORY_PORT');
