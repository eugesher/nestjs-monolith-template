import { Maybe } from '@acme-libs/toolkit';
import { IAuthCurrentUserView, IAuthJwtPayloadQuery } from '../interfaces';

export interface IAuthUserValidatorPort {
  validate(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>>;
}

export const AUTH_USER_VALIDATOR_PORT = Symbol('AUTH_USER_VALIDATOR_PORT');
