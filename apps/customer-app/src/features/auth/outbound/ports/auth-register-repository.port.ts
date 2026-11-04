import { IAuthRegisterCustomerInsertQuery } from '../interfaces';

export interface IAuthRegisterRepositoryPort {
  insert(query: IAuthRegisterCustomerInsertQuery): Promise<string>;
}

export const AUTH_REGISTER_REPOSITORY_PORT = Symbol('AUTH_REGISTER_REPOSITORY_PORT');
