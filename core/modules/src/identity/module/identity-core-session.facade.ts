import { Injectable } from '@nestjs/common';

import {
  IIdentityCoreAccessTokenView,
  IIdentityCoreLoginCommand,
  IIdentityCoreSessionPort,
  IIdentityCoreSubjectView,
  IIdentityCoreValidateSubjectQuery,
} from '@acme-core/contracts/identity';
import { Maybe } from '@acme-libs/toolkit';
import { IdentityCoreLoginUseCase, IdentityCoreValidateSubjectUseCase } from '../application';

@Injectable()
export class IdentityCoreSessionFacade implements IIdentityCoreSessionPort {
  constructor(
    private readonly identityCoreLogin: IdentityCoreLoginUseCase,
    private readonly identityCoreValidateSubject: IdentityCoreValidateSubjectUseCase,
  ) {}

  public login(command: IIdentityCoreLoginCommand): Promise<IIdentityCoreAccessTokenView> {
    return this.identityCoreLogin.execute(command);
  }

  public validateSubject(
    query: IIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<IIdentityCoreSubjectView>> {
    return this.identityCoreValidateSubject.execute(query);
  }
}
