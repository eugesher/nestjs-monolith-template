import { RoleEnum } from '@acme-libs/kernel';

import {
  IUserStaffRoleFoundRecord,
  IUserStaffUserInsertQuery,
  IUserStaffUserRoleInsertQuery,
} from '../interfaces';

export interface IUserRegisterRepositoryPort {
  insertUser(query: IUserStaffUserInsertQuery): Promise<string>;
  findRoles(names: RoleEnum[]): Promise<IUserStaffRoleFoundRecord[]>;
  insertUserRoles(queries: IUserStaffUserRoleInsertQuery[]): Promise<void>;
}

export const USER_REGISTER_REPOSITORY_PORT = Symbol('USER_REGISTER_REPOSITORY_PORT');
