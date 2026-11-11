import { DomainException } from '@acme-libs/toolkit';
import type { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

export abstract class RoleBaseException extends DomainException {
  public abstract override readonly code:
    IdentityExceptionCodeEnum.AUTH_ROLE_NAME_TAKEN | IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND;
}
