import { RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { UserStaffUserModel } from '../../domain';

export interface IUserAssignRoleRepositoryPort {
  findById(id: string): Promise<Maybe<UserStaffUserModel>>;
  addRole(userId: string, role: RoleEnum): Promise<boolean>;
}

export const USER_ASSIGN_ROLE_REPOSITORY_PORT = Symbol('USER_ASSIGN_ROLE_REPOSITORY_PORT');
