import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';

export abstract class AuthBaseException extends DomainException {
  public abstract override readonly code:
    | IdentityExceptionCodeEnum.AUTH_INVALID_CREDENTIALS
    | IdentityExceptionCodeEnum.AUTH_USER_INACTIVE;
}
