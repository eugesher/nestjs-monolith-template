import { IdentityErrorCodeEnum } from '@acme-libs/kernel';

import { RoleBaseException } from './base/role-base.exception';

export class AuthPermissionNotFoundException extends RoleBaseException {
  public readonly code = IdentityErrorCodeEnum.AUTH_PERMISSION_NOT_FOUND;

  constructor(codes: string[], message = `Unknown permission codes: ${codes.join(', ')}`) {
    super(message);
  }
}
