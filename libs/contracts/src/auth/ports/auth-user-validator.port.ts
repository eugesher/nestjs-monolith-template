import { Nullable } from '@acme-libs/toolkit';

import { IAuthCurrentUserView, IAuthJwtPayloadCommand } from '../interfaces';

export interface IAuthUserValidatorPort {
  validate(command: IAuthJwtPayloadCommand): Promise<Nullable<IAuthCurrentUserView>>;
}

export const AUTH_USER_VALIDATOR_PORT = Symbol('AUTH_USER_VALIDATOR_PORT');
