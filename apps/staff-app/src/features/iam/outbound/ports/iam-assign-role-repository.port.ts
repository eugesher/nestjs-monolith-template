import { RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { IamStaffUserModel } from '../../domain';

export interface IIamAssignRoleRepositoryPort {
  findById(id: string): Promise<Maybe<IamStaffUserModel>>;
  addRole(userId: string, role: RoleEnum): Promise<boolean>;
}

export const IAM_ASSIGN_ROLE_REPOSITORY_PORT = Symbol('IAM_ASSIGN_ROLE_REPOSITORY_PORT');
