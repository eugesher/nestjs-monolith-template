import { UserStaffUserModel } from '../../domain';

export interface IUserRegisterRepositoryPort {
  insert(user: UserStaffUserModel): Promise<void>;
}

export const USER_REGISTER_REPOSITORY_PORT = Symbol('USER_REGISTER_REPOSITORY_PORT');
