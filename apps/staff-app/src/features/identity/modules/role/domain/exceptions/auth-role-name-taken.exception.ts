import { IdentityExceptionCodeEnum } from '@acme-libs/kernel';

import { RoleBaseException } from './base/role-base.exception';

export class AuthRoleNameTakenException extends RoleBaseException {
  public readonly code = IdentityExceptionCodeEnum.AUTH_ROLE_NAME_TAKEN;

  constructor(name: string, message = `Role name ${name} is already taken`) {
    super(message);
  }
}
