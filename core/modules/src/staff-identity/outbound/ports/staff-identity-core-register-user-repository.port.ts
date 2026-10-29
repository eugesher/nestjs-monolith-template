import { StaffIdentityCoreUserModel } from '../../domain';

export interface IStaffIdentityCoreRegisterUserRepositoryPort {
  insert(user: StaffIdentityCoreUserModel): Promise<void>;
}

export const STAFF_IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT',
);
