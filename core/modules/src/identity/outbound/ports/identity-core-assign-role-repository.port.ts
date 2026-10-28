import { RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreUserModel } from '../../domain';

export interface IIdentityCoreAssignRoleRepositoryPort {
  findById(id: string): Promise<Maybe<IdentityCoreUserModel>>;
  addRole(userId: string, role: RoleEnum): Promise<boolean>;
}

export const IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT = Symbol(
  'IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT',
);
