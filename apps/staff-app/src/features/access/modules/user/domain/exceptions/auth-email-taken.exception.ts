import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { UserBaseException } from './base/user-base.exception';

export class AuthEmailTakenException extends UserBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_EMAIL_TAKEN;

  constructor(email: string, message = `Email ${email} is already registered`) {
    super(message);
  }
}
