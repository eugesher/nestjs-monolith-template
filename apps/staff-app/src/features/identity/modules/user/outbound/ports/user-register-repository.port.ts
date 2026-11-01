import { IUserStaffUserDraft, UserStaffUserModel } from '../../domain';

export interface IUserRegisterRepositoryPort {
  insert(draft: IUserStaffUserDraft): Promise<UserStaffUserModel>;
}

export const USER_REGISTER_REPOSITORY_PORT = Symbol('USER_REGISTER_REPOSITORY_PORT');
