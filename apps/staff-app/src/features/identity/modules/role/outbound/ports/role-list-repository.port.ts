import { RoleModel } from '../../domain';

export interface IRoleListRepositoryPort {
  list(): Promise<RoleModel[]>;
}

export const ROLE_LIST_REPOSITORY_PORT = Symbol('ROLE_LIST_REPOSITORY_PORT');
