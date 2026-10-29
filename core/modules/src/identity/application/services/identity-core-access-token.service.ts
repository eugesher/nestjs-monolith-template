import { Inject, Injectable } from '@nestjs/common';

import { IIdentityCoreAccessTokenView } from '@acme-core/contracts/identity';
import { IdentityCoreUserModel } from '../../domain';
import { IDENTITY_CORE_ACCESS_TOKEN_PORT, type IIdentityCoreAccessTokenPort } from '../../outbound';

@Injectable()
export class IdentityCoreAccessTokenService {
  constructor(
    @Inject(IDENTITY_CORE_ACCESS_TOKEN_PORT)
    private readonly accessToken: IIdentityCoreAccessTokenPort,
  ) {}

  public async issue(user: IdentityCoreUserModel): Promise<IIdentityCoreAccessTokenView> {
    const payload = { sub: user.id };
    const accessToken = await this.accessToken.sign(payload);

    return { accessToken };
  }
}
