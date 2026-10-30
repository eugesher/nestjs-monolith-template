import { Inject, Injectable } from '@nestjs/common';

import { IStaffIdentityCommonAccessTokenView } from '@acme-staff-contracts/staff-identity';
import {
  CREDENTIALS_ACCESS_TOKEN_PORT,
  type ICredentialsAccessTokenPort,
} from '@acme-libs/contracts/credentials';
import { StaffIdentityCommonUserModel } from '../../domain';

@Injectable()
export class StaffIdentityCommonAccessTokenService {
  constructor(
    @Inject(CREDENTIALS_ACCESS_TOKEN_PORT)
    private readonly accessToken: ICredentialsAccessTokenPort,
  ) {}

  public async issue(
    user: StaffIdentityCommonUserModel,
  ): Promise<IStaffIdentityCommonAccessTokenView> {
    const payload = { sub: user.id };
    const accessToken = await this.accessToken.sign(payload);

    return { accessToken };
  }
}
