import { Nullable } from '@acme-libs/toolkit';

import { IAuthStaffUserFoundRecord } from '../interfaces';

export interface IAuthLoginRepositoryPort {
  findByEmail(email: string): Promise<Nullable<IAuthStaffUserFoundRecord>>;
}

export const AUTH_LOGIN_REPOSITORY_PORT = Symbol('AUTH_LOGIN_REPOSITORY_PORT');
