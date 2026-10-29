import { RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCoreUserModel } from '../../domain';

export interface IStaffIdentityCoreAssignRoleRepositoryPort {
  findById(id: string): Promise<Maybe<StaffIdentityCoreUserModel>>;
  addRole(userId: string, role: RoleEnum): Promise<boolean>;
}

export const STAFF_IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT',
);
