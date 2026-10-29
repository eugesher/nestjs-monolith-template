import { Injectable } from '@nestjs/common';

import {
  IAuthClaimsPort,
  IAuthFindPermissionCodesQuery,
  IAuthFindRolesQuery,
} from '@acme-libs/contracts/auth';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { AuthStaffIdentityCoreAdapter } from '../infrastructure';

@Injectable()
export class AuthClaimsFacade implements IAuthClaimsPort {
  constructor(private readonly identity: AuthStaffIdentityCoreAdapter) {}

  public findRoles(query: IAuthFindRolesQuery): Promise<RoleEnum[]> {
    return this.identity.findRoles(query);
  }

  public findPermissionCodes(query: IAuthFindPermissionCodesQuery): Promise<PermissionCodeEnum[]> {
    return this.identity.findPermissionCodes(query);
  }
}
