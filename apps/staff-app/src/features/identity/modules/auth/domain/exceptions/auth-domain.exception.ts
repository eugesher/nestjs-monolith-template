import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';

export class AuthDomainException extends DomainException {
  public readonly code: IdentityErrorCodeEnum;

  constructor(code: IdentityErrorCodeEnum, message: string) {
    super(message);
    this.code = code;
  }
}
