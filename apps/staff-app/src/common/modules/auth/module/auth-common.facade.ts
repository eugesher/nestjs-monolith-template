import { Injectable } from '@nestjs/common';

import { Nullable } from '@acme-libs-toolkit';

import {
  IAuthCommonPort,
  IAuthCommonSubjectView,
  IAuthCommonValidateSubjectQuery,
} from '@acme-staff-contracts/auth';

import { AuthCommonValidateSubjectUseCase } from '../application';

@Injectable()
export class AuthCommonFacade implements IAuthCommonPort {
  constructor(private readonly authCommonValidateSubject: AuthCommonValidateSubjectUseCase) {}

  public async validateSubject(
    query: IAuthCommonValidateSubjectQuery,
  ): Promise<Nullable<IAuthCommonSubjectView>> {
    return await this.authCommonValidateSubject.execute(query);
  }
}
