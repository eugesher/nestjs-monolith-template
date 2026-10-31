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

  public async findRoles(query: IAuthFindRolesQuery): Promise<RoleEnum[]> {
    return await this.authGlobalFindRoles.execute(query);
  }

  public async findPermissionCodes(
    query: IAuthFindPermissionCodesQuery,
  ): Promise<PermissionCodeEnum[]> {
    return await this.authGlobalFindPermissionCodes.execute(query);
  }
}
