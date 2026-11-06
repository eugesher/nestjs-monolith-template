import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from './base/auth-base.exception';

export class AuthUserInactiveException extends AuthBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_USER_INACTIVE;

  constructor(userId: string, message = `User ${userId} is disabled`) {
    super(message);
  }
}
