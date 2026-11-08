import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { UserBaseException } from './base/user-base.exception';

export class AuthRoleNotFoundException extends UserBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND;

  constructor(id: string, message = `Role ${id} was not found`) {
    super(message);
  }
}
