import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { UserBaseException } from './base/user-base.exception';

export class AuthUserNotFoundException extends UserBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_USER_NOT_FOUND;

  constructor(userId: string, message = `User ${userId} was not found`) {
    super(message);
  }
}
