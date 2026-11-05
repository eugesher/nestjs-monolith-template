import { Inject, Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs/toolkit';
import { AUTH_COMMON_PORT, type IAuthCommonPort } from '@acme-processor/contracts/auth';

import { IAuthGlobalSubjectView, IAuthGlobalSubjectPort } from '../../outbound';

@Injectable()
export class AuthGlobalSubjectCommonAdapter implements IAuthGlobalSubjectPort {
  constructor(
    @Inject(AUTH_COMMON_PORT)
    private readonly authCommon: IAuthCommonPort,
  ) {}

  public async findSubject(userId: string): Promise<Nullable<IAuthGlobalSubjectView>> {
    return await this.authCommon.validateSubject({ userId });
  }
}
