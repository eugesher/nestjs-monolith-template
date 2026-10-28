import { Injectable } from '@nestjs/common';

import {
  IIdentityCoreLoginCommand,
  IIdentityCoreRefreshTokenCommand,
  IIdentityCoreSessionPort,
  IIdentityCoreSubjectView,
  IIdentityCoreTokenPairView,
  IIdentityCoreValidateSubjectQuery,
} from '@acme-core/contracts/identity';
import { Maybe } from '@acme-libs/toolkit';
import {
  IdentityCoreLoginUseCase,
  IdentityCoreRefreshTokenUseCase,
  IdentityCoreValidateSubjectUseCase,
} from '../application';

@Injectable()
export class IdentityCoreSessionFacade implements IIdentityCoreSessionPort {
  constructor(
    private readonly identityCoreLogin: IdentityCoreLoginUseCase,
    private readonly identityCoreRefreshToken: IdentityCoreRefreshTokenUseCase,
    private readonly identityCoreValidateSubject: IdentityCoreValidateSubjectUseCase,
  ) {}

  public login(command: IIdentityCoreLoginCommand): Promise<IIdentityCoreTokenPairView> {
    return this.identityCoreLogin.execute(command);
  }

  public refreshToken(
    command: IIdentityCoreRefreshTokenCommand,
  ): Promise<IIdentityCoreTokenPairView> {
    return this.identityCoreRefreshToken.execute(command);
  }

  public validateSubject(
    query: IIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<IIdentityCoreSubjectView>> {
    return this.identityCoreValidateSubject.execute(query);
  }
}
