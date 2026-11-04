import { Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { AUTH_COMMON_PORT, type IAuthCommonPort } from '@acme-staff/contracts/auth';

import {
  IAuthIdentityFindSubjectCommand,
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
    command: IAuthIdentityFindSubjectCommand,
  ): Promise<Nullable<IAuthIdentitySubjectView>> {
    const { userId } = command;

    return await this.authCommon.validateSubject({ userId });
  }
}
