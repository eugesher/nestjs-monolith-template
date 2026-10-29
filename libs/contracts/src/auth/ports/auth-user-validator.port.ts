import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import {
  IAuthCurrentUserView,
  IAuthFindPermissionCodesQuery,
  IAuthJwtPayloadQuery,
} from '../interfaces';

export interface IAuthUserValidatorPort {
  validate(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>>;
  findPermissionCodes(query: IAuthFindPermissionCodesQuery): Promise<PermissionCodeEnum[]>;
}

export const AUTH_USER_VALIDATOR_PORT = Symbol('AUTH_USER_VALIDATOR_PORT');
