import { DomainException } from '@acme-libs/toolkit';
import type { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

export abstract class AuthBaseException extends DomainException {
  public abstract override readonly code:
    | IdentityExceptionCodeEnum.AUTH_EMAIL_INVALID
    | IdentityExceptionCodeEnum.AUTH_EMAIL_TAKEN
    | IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS
    | IdentityExceptionCodeEnum.AUTH_PASSWORD_TOO_WEAK
    | IdentityExceptionCodeEnum.AUTH_USER_INACTIVE;
}
