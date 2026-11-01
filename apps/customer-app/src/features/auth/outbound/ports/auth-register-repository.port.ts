import { AuthCustomerModel, IAuthCustomerDraft } from '../../domain';

export interface IAuthRegisterRepositoryPort {
  insert(draft: IAuthCustomerDraft): Promise<AuthCustomerModel>;
}

export const AUTH_REGISTER_REPOSITORY_PORT = Symbol('AUTH_REGISTER_REPOSITORY_PORT');
