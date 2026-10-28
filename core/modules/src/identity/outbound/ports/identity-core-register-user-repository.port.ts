import { IdentityCoreUserModel } from '../../domain';

export interface IIdentityCoreRegisterUserRepositoryPort {
  existsByEmail(email: string): Promise<boolean>;
  insert(user: IdentityCoreUserModel): Promise<void>;
}

export const IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT = Symbol(
  'IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT',
);
