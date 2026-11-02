import { IdentityErrorCodeEnum } from '@acme-libs/kernel';

import { UserBaseException } from './base/user-base.exception';

export class AuthRoleNotFoundException extends UserBaseException {
  public readonly code = IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND;

  constructor(role: string, message = `Role ${role} was not found`) {
    super(message);
  }
}
