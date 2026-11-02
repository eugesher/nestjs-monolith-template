import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';

export abstract class UserBaseException extends DomainException {
  public abstract override readonly code: IdentityErrorCodeEnum;
}
