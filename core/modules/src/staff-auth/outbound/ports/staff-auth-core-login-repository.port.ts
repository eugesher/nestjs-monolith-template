import type { Nullable } from '@acme-libs/toolkit';

import type { IStaffAuthCoreLoginStaffUserRecord } from '../interfaces';

export interface IStaffAuthCoreLoginRepositoryPort {
  findByEmail(email: string): Promise<Nullable<IStaffAuthCoreLoginStaffUserRecord>>;
}

export const STAFF_AUTH_CORE_LOGIN_REPOSITORY_PORT = Symbol(
  'STAFF_AUTH_CORE_LOGIN_REPOSITORY_PORT',
);
