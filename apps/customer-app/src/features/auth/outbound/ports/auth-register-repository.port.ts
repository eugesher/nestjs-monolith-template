import { IAuthRegisterCustomerInsertQuery, IAuthRegisterCustomerInsertRecord } from '../interfaces';

export interface IAuthRegisterRepositoryPort {
  insert(query: IAuthRegisterCustomerInsertQuery): Promise<IAuthRegisterCustomerInsertRecord>;
}

export const AUTH_REGISTER_REPOSITORY_PORT = Symbol('AUTH_REGISTER_REPOSITORY_PORT');
