import { Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs-toolkit';

import { AUTH_COMMON_PORT, type IAuthCommonPort } from '@acme-staff-contracts/auth';

import { IAuthGlobalStaffUserView, IAuthGlobalSubjectPort } from '../../outbound';

@Injectable()
export class AuthGlobalSubjectCommonAdapter implements IAuthGlobalSubjectPort {
  constructor(
    @Inject(AUTH_COMMON_PORT)
    private readonly authCommon: IAuthCommonPort,
  ) {}

  public async findSubject(userId: string): Promise<Nullable<IAuthGlobalStaffUserView>> {
    return await this.authCommon.validateSubject({ userId });
  }
}
