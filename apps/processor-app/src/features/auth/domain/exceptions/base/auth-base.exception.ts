import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';

export abstract class AuthBaseException extends DomainException {
  public abstract override readonly code: IdentityExceptionCodeEnum;
}
