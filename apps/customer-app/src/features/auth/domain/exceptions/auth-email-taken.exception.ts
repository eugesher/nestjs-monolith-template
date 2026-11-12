import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from './base/auth-base.exception';

export class AuthEmailTakenException extends AuthBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_EMAIL_TAKEN;

  constructor(message = 'Email is already registered') {
    super(message);
  }
}
