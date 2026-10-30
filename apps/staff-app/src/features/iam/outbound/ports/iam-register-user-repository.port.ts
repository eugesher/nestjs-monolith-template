import { IamStaffUserModel } from '../../domain';

export interface IIamRegisterUserRepositoryPort {
  insert(user: IamStaffUserModel): Promise<void>;
}

export const IAM_REGISTER_USER_REPOSITORY_PORT = Symbol('IAM_REGISTER_USER_REPOSITORY_PORT');
