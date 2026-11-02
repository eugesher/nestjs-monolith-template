import { IdentityErrorCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from './base/auth-base.exception';

export class AuthUserNotFoundException extends AuthBaseException {
  public readonly code = IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND;

  constructor(userId: string, message = `User ${userId} was not found`) {
    super(message);
  }
}
