import { Injectable } from '@nestjs/common';

import {
  IAuthCommonPort,
  IAuthCommonSubjectView,
  IAuthCommonValidateSubjectQuery,
} from '@acme-staff-contracts/auth';
import { Maybe } from '@acme-libs/toolkit';
import { AuthCommonValidateSubjectUseCase } from '../application';

@Injectable()
export class AuthCommonFacade implements IAuthCommonPort {
  constructor(private readonly authCommonValidateSubject: AuthCommonValidateSubjectUseCase) {}

  public async validateSubject(
    query: IAuthCommonValidateSubjectQuery,
  ): Promise<Maybe<IAuthCommonSubjectView>> {
    return await this.authCommonValidateSubject.execute(query);
  }
}
