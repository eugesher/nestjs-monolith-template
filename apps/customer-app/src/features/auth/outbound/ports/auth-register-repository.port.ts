import { IAuthCustomerInsertCommand } from '../interfaces';

export interface IAuthRegisterRepositoryPort {
  insert(command: IAuthCustomerInsertCommand): Promise<string>;
}

export const AUTH_REGISTER_REPOSITORY_PORT = Symbol('AUTH_REGISTER_REPOSITORY_PORT');
