import { RoleEnum } from '@acme-libs/kernel';

import {
  IUserRegisterStaffRoleRecord,
  IUserRegisterStaffUserInsertQuery,
  IUserRegisterStaffUserRoleInsertQuery,
} from '../interfaces';

export interface IUserRegisterRepositoryPort {
  insertUser(query: IUserRegisterStaffUserInsertQuery): Promise<string>;
  findRoles(names: RoleEnum[]): Promise<IUserRegisterStaffRoleRecord>;
  insertUserRoles(queries: IUserRegisterStaffUserRoleInsertQuery[]): Promise<void>;
}

export const USER_REGISTER_REPOSITORY_PORT = Symbol('USER_REGISTER_REPOSITORY_PORT');
