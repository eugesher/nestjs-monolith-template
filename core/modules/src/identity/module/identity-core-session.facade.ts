import { Injectable } from '@nestjs/common';

import {
  IIdentityCoreAccessTokenView,
  IIdentityCoreFindPermissionCodesQuery,
  IIdentityCoreLoginCommand,
  IIdentityCoreSessionPort,
  IIdentityCoreSubjectView,
  IIdentityCoreValidateSubjectQuery,
} from '@acme-core/contracts/identity';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import {
  IdentityCoreFindPermissionCodesUseCase,
  IdentityCoreLoginUseCase,
  IdentityCoreValidateSubjectUseCase,
} from '../application';

@Injectable()
export class IdentityCoreSessionFacade implements IIdentityCoreSessionPort {
  constructor(
    private readonly identityCoreFindPermissionCodes: IdentityCoreFindPermissionCodesUseCase,
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

  public findPermissionCodes(
    query: IIdentityCoreFindPermissionCodesQuery,
  ): Promise<PermissionCodeEnum[]> {
    return this.identityCoreFindPermissionCodes.execute(query);
  }
}
