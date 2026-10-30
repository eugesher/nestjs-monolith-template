import { Injectable } from '@nestjs/common';

import {
  IAuthClaimsPort,
  IAuthFindPermissionCodesQuery,
  IAuthFindRolesQuery,
} from '@acme-libs/contracts/auth';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { AuthGlobalFindPermissionCodesUseCase, AuthGlobalFindRolesUseCase } from '../application';

@Injectable()
export class AuthGlobalClaimsFacade implements IAuthClaimsPort {
  constructor(
    private readonly authGlobalFindPermissionCodes: AuthGlobalFindPermissionCodesUseCase,
    private readonly authGlobalFindRoles: AuthGlobalFindRolesUseCase,
  ) {}

  public findRoles(query: IAuthFindRolesQuery): Promise<RoleEnum[]> {
    return this.authGlobalFindRoles.execute(query);
  }

  public findPermissionCodes(query: IAuthFindPermissionCodesQuery): Promise<PermissionCodeEnum[]> {
    return this.authGlobalFindPermissionCodes.execute(query);
  }
}
