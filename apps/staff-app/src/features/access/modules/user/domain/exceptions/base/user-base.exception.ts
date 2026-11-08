import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';

export abstract class UserBaseException extends DomainException {
  public abstract override readonly code:
    | IdentityExceptionCodeEnum.AUTH_EMAIL_INVALID
    | IdentityExceptionCodeEnum.AUTH_EMAIL_TAKEN
    | IdentityExceptionCodeEnum.AUTH_PASSWORD_TOO_WEAK
    | IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND
    | IdentityExceptionCodeEnum.AUTH_USER_NOT_FOUND;
}
