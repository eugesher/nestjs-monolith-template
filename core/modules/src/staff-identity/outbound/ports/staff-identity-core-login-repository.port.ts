import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCoreUserModel } from '../../domain';

export interface IStaffIdentityCoreLoginRepositoryPort {
  findByEmail(email: string): Promise<Maybe<StaffIdentityCoreUserModel>>;
}

export const STAFF_IDENTITY_CORE_LOGIN_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_CORE_LOGIN_REPOSITORY_PORT',
);
