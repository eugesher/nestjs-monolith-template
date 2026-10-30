import { RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCommonUserModel } from '../../domain';

export interface IStaffIdentityCommonAssignRoleRepositoryPort {
  findById(id: string): Promise<Maybe<StaffIdentityCommonUserModel>>;
  addRole(userId: string, role: RoleEnum): Promise<boolean>;
}

export const STAFF_IDENTITY_COMMON_ASSIGN_ROLE_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_COMMON_ASSIGN_ROLE_REPOSITORY_PORT',
);
