import { Inject, Injectable } from '@nestjs/common';

import { IStaffIdentityCoreAccessTokenView } from '@acme-core/contracts/staff-identity';
import {
  CREDENTIALS_ACCESS_TOKEN_PORT,
  type ICredentialsAccessTokenPort,
} from '@acme-libs/contracts/credentials';
import { StaffIdentityCoreUserModel } from '../../domain';

@Injectable()
export class StaffIdentityCoreAccessTokenService {
  constructor(
    @Inject(CREDENTIALS_ACCESS_TOKEN_PORT)
    private readonly accessToken: ICredentialsAccessTokenPort,
  ) {}

  public async issue(user: StaffIdentityCoreUserModel): Promise<IStaffIdentityCoreAccessTokenView> {
    const payload = { sub: user.id };
    const accessToken = await this.accessToken.sign(payload);

    return { accessToken };
  }
}
