import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { UserBaseException } from './base/user-base.exception';

export class AuthEmailInvalidException extends UserBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_EMAIL_INVALID;

  constructor(message = 'User email must be a well-formed address') {
    super(message);
  }
}
