import { Inject, Injectable } from '@nestjs/common';

import { IStaffIdentityCoreAccessTokenView } from '@acme-core/contracts/staff-identity';
import { StaffIdentityCoreUserModel } from '../../domain';
import {
  STAFF_IDENTITY_CORE_ACCESS_TOKEN_PORT,
  type IStaffIdentityCoreAccessTokenPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCoreAccessTokenService {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_ACCESS_TOKEN_PORT)
    private readonly accessToken: IStaffIdentityCoreAccessTokenPort,
  ) {}

  public async issue(user: StaffIdentityCoreUserModel): Promise<IStaffIdentityCoreAccessTokenView> {
    const payload = { sub: user.id };
    const accessToken = await this.accessToken.sign(payload);

    return { accessToken };
  }
}
