import { RoleEnum } from '@acme-libs/kernel';

import {
  IUserStaffRoleFoundRecord,
  IUserStaffUserInsertCommand,
  IUserStaffUserRoleInsertCommand,
} from '../interfaces';

export interface IUserRegisterRepositoryPort {
  insertUser(command: IUserStaffUserInsertCommand): Promise<string>;
  findRoles(names: RoleEnum[]): Promise<IUserStaffRoleFoundRecord[]>;
  insertUserRoles(commands: IUserStaffUserRoleInsertCommand[]): Promise<void>;
}

export const USER_REGISTER_REPOSITORY_PORT = Symbol('USER_REGISTER_REPOSITORY_PORT');
