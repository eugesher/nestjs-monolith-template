import { Inject, Injectable } from '@nestjs/common';

import { IIdentityCoreAccessTokenView } from '@acme-core/contracts/identity';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { IdentityCoreUserModel } from '../../domain';
import { IDENTITY_CORE_ACCESS_TOKEN_PORT, type IIdentityCoreAccessTokenPort } from '../../outbound';

@Injectable()
export class IdentityCoreAccessTokenService {
  constructor(
    @Inject(IDENTITY_CORE_ACCESS_TOKEN_PORT)
    private readonly accessToken: IIdentityCoreAccessTokenPort,
  ) {}

  public async issue(
    user: IdentityCoreUserModel,
    permissionCodes: PermissionCodeEnum[],
  ): Promise<IIdentityCoreAccessTokenView> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: [...user.roles],
      permissions: permissionCodes,
    };
    const accessToken = await this.accessToken.sign(payload);

    return { accessToken };
  }
}
