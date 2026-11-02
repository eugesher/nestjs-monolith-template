import { IdentityErrorCodeEnum } from '@acme-libs/kernel';

import { UserBaseException } from './base/user-base.exception';

export class AuthPasswordTooWeakException extends UserBaseException {
  public readonly code = IdentityErrorCodeEnum.AUTH_PASSWORD_TOO_WEAK;

  constructor(minLength: number, message = `Password must be at least ${minLength} characters`) {
    super(message);
  }
}
