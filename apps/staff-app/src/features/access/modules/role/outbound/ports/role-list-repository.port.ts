import type { IRoleListRecord } from '../interfaces';

export interface IRoleListRepositoryPort {
  list(): Promise<IRoleListRecord[]>;
}

export const ROLE_LIST_REPOSITORY_PORT = Symbol('ROLE_LIST_REPOSITORY_PORT');
