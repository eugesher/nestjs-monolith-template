import type { Nullable } from '@acme-libs/toolkit';

import type { IStaffAuthCoreFindByEmailStaffUserRecord } from '../interfaces';

export interface IStaffAuthCoreFindByEmailRepositoryPort {
  findByEmail(email: string): Promise<Nullable<IStaffAuthCoreFindByEmailStaffUserRecord>>;
}

export const STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT = Symbol(
  'STAFF_AUTH_CORE_FIND_BY_EMAIL_REPOSITORY_PORT',
);
