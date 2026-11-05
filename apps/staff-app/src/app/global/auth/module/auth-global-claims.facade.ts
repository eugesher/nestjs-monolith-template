import { Injectable } from '@nestjs/common';

import {
  IAuthClaimsPort,
  IAuthFindPermissionCodesCommand,
  IAuthFindRolesCommand,
} from '@acme-libs/contracts/auth';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';

import { AuthGlobalFindPermissionCodesUseCase, AuthGlobalFindRolesUseCase } from '../application';

@Injectable()
export class AuthGlobalClaimsFacade implements IAuthClaimsPort {
  constructor(
    private readonly authGlobalFindPermissionCodes: AuthGlobalFindPermissionCodesUseCase,
    private readonly authGlobalFindRoles: AuthGlobalFindRolesUseCase,
  ) {}

  public async findRoles(command: IAuthFindRolesCommand): Promise<RoleEnum[]> {
    return await this.authGlobalFindRoles.execute(command);
  }

  public async findPermissionCodes(
    command: IAuthFindPermissionCodesCommand,
  ): Promise<PermissionCodeEnum[]> {
    return await this.authGlobalFindPermissionCodes.execute(command);
  }
}
