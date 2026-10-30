import { StaffIdentityCommonUserModel } from '../../domain';

export interface IStaffIdentityCommonRegisterUserRepositoryPort {
  insert(user: StaffIdentityCommonUserModel): Promise<void>;
}

export const STAFF_IDENTITY_COMMON_REGISTER_USER_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_COMMON_REGISTER_USER_REPOSITORY_PORT',
);
