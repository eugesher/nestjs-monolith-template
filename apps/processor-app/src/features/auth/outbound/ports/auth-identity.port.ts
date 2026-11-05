import { Nullable } from '@acme-libs/toolkit';

import { IAuthIdentityFindByEmailCommand, IAuthIdentityUserView } from '../interfaces';

export interface IAuthIdentityPort {
  findByEmail(command: IAuthIdentityFindByEmailCommand): Promise<Nullable<IAuthIdentityUserView>>;
}

export const AUTH_IDENTITY_PORT = Symbol('AUTH_IDENTITY_PORT');
