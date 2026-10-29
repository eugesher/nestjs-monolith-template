import { StaffIdentityCoreRoleModel } from '../../domain';

export interface IStaffIdentityCoreListRolesRepositoryPort {
  list(): Promise<StaffIdentityCoreRoleModel[]>;
}

export const STAFF_IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT',
);
