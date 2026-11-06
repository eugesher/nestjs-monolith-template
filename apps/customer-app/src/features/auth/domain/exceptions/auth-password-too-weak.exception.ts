import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { AuthBaseException } from './base/auth-base.exception';

export class AuthPasswordTooWeakException extends AuthBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_PASSWORD_TOO_WEAK;

  constructor(minLength: number, message = `Password must be at least ${minLength} characters`) {
    super(message);
  }
}
