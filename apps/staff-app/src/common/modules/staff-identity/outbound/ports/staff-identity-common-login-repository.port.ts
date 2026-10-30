import { Maybe } from '@acme-libs/toolkit';
import { StaffIdentityCommonUserModel } from '../../domain';

export interface IStaffIdentityCommonLoginRepositoryPort {
  findByEmail(email: string): Promise<Maybe<StaffIdentityCommonUserModel>>;
}

export const STAFF_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT = Symbol(
  'STAFF_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT',
);
