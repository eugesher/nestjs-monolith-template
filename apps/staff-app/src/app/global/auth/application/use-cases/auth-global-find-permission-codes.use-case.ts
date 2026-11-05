import { Inject, Injectable } from '@nestjs/common';

import { PermissionCodeEnum } from '@acme-libs/kernel';

import {
  AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT,
  type IAuthGlobalFindPermissionCodesRepositoryPort,
} from '../../outbound';
import { IAuthGlobalFindPermissionCodesCommand } from '../interfaces';

@Injectable()
export class AuthGlobalFindPermissionCodesUseCase {
  constructor(
    @Inject(AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT)
    private readonly repository: IAuthGlobalFindPermissionCodesRepositoryPort,
  ) {}

  public async execute(
    command: IAuthGlobalFindPermissionCodesCommand,
  ): Promise<PermissionCodeEnum[]> {
    const { userId } = command;

    const permissions = await this.repository.findPermissionCodes(userId);

    return permissions.map((permission) => permission.code);
  }
}
