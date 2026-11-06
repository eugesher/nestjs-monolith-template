import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from './base/auth-base.exception';

export class AuthInvalidCredentialsException extends AuthBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS;

  constructor(message = 'Invalid credentials') {
    super(message);
  }
}
