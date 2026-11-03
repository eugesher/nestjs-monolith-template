import { IRoleListedRecord } from '../interfaces';

export interface IRoleListRepositoryPort {
  list(): Promise<IRoleListedRecord[]>;
}

export const ROLE_LIST_REPOSITORY_PORT = Symbol('ROLE_LIST_REPOSITORY_PORT');
