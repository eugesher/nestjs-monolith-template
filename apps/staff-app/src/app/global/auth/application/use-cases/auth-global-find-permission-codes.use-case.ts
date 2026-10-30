import { Inject, Injectable } from '@nestjs/common';

import { PermissionCodeEnum } from '@acme-libs/kernel';
import {
  AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT,
  type IAuthGlobalFindPermissionCodesRepositoryPort,
} from '../../outbound';
import { IAuthGlobalFindPermissionCodesQuery } from '../interfaces';

@Injectable()
export class AuthGlobalFindPermissionCodesUseCase {
  constructor(
    @Inject(AUTH_GLOBAL_FIND_PERMISSION_CODES_REPOSITORY_PORT)
    private readonly repository: IAuthGlobalFindPermissionCodesRepositoryPort,
  ) {}

  public execute(query: IAuthGlobalFindPermissionCodesQuery): Promise<PermissionCodeEnum[]> {
    const { userId } = query;

    return this.repository.findPermissionCodes(userId);
  }
}
