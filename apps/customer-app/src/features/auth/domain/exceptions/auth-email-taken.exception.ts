import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from './base/auth-base.exception';

export class AuthEmailTakenException extends AuthBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_EMAIL_TAKEN;

  constructor(email: string, message = `Email ${email} is already registered`) {
    super(message);
  }
}
