import { IAuthCustomerInsertQuery } from '../interfaces';

export interface IAuthRegisterRepositoryPort {
  insert(query: IAuthCustomerInsertQuery): Promise<string>;
}

export const AUTH_REGISTER_REPOSITORY_PORT = Symbol('AUTH_REGISTER_REPOSITORY_PORT');
