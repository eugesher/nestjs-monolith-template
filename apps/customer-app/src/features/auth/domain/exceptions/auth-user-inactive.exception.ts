import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from './base/auth-base.exception';

export class AuthUserInactiveException extends AuthBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_USER_INACTIVE;

  constructor(customerId: string, message = `Customer ${customerId} is disabled`) {
    super(message);
  }
}
