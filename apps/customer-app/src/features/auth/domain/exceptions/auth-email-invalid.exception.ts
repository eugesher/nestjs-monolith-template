import { IdentityErrorCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from './base/auth-base.exception';

export class AuthEmailInvalidException extends AuthBaseException {
  public readonly code = IdentityErrorCodeEnum.AUTH_EMAIL_INVALID;

  constructor(message = 'Customer email must be a well-formed address') {
    super(message);
  }
}
