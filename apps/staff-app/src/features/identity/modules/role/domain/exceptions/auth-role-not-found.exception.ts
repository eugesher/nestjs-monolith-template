import { IdentityErrorCodeEnum } from '@acme-libs/kernel';

import { RoleBaseException } from './base/role-base.exception';

export class AuthRoleNotFoundException extends RoleBaseException {
  public readonly code = IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND;

  constructor(name: string, message = `Role ${name} was not found`) {
    super(message);
  }
}
