import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { RoleBaseException } from './base/role-base.exception';

export class AuthRoleNotFoundException extends RoleBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_ROLE_NOT_FOUND;

  constructor(id: string, message = `Role ${id} was not found`) {
    super(message);
  }
}
