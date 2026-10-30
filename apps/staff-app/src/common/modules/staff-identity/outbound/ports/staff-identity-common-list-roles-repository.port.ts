import { StaffIdentityCommonRoleModel } from '../../domain';

export interface IStaffIdentityCommonListRolesRepositoryPort {
  list(): Promise<StaffIdentityCommonRoleModel[]>;
}

export const STAFF_IDENTITY_COMMON_LIST_ROLES_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_COMMON_LIST_ROLES_REPOSITORY_PORT',
);
