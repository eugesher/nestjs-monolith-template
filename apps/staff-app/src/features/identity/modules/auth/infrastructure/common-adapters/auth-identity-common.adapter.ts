import { Inject, Injectable } from '@nestjs/common';

import { AUTH_COMMON_PORT, type IAuthCommonPort } from '@acme-staff-contracts/auth';
import { Maybe } from '@acme-libs/toolkit';
import {
  IAuthIdentityFindSubjectQuery,
  IAuthIdentityPort,
  IAuthIdentitySubjectView,
} from '../../outbound';

@Injectable()
export class AuthIdentityCommonAdapter implements IAuthIdentityPort {
  constructor(
    @Inject(AUTH_COMMON_PORT)
    private readonly authCommon: IAuthCommonPort,
  ) {}

  public async findSubject(
    query: IAuthIdentityFindSubjectQuery,
  ): Promise<Maybe<IAuthIdentitySubjectView>> {
    const { userId } = query;

    return await this.authCommon.validateSubject({ userId });
  }
}
