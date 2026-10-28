import { IdentityCoreRoleModel } from '../../domain';

export interface IIdentityCoreListRolesRepositoryPort {
  list(): Promise<IdentityCoreRoleModel[]>;
}

export const IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT = Symbol(
  'IDENTITY_CORE_LIST_ROLES_REPOSITORY_PORT',
);
