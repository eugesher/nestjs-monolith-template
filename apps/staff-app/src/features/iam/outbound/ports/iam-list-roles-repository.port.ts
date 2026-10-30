import { IamRoleModel } from '../../domain';

export interface IIamListRolesRepositoryPort {
  list(): Promise<IamRoleModel[]>;
}

export const IAM_LIST_ROLES_REPOSITORY_PORT = Symbol('IAM_LIST_ROLES_REPOSITORY_PORT');
