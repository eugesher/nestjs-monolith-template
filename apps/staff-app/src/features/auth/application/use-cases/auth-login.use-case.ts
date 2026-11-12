import { Inject, Injectable } from '@nestjs/common';

import { AuthInvalidCredentialsException, AuthUserInactiveException } from '../../domain';
import {
  AUTH_IDENTITY_PORT,
  AuthIdentityLoginOutcomeEnum,
  type IAuthIdentityPort,
} from '../../outbound';
import type { IAuthLoginCommand, IAuthLoginView } from '../interfaces';

@Injectable()
export class AuthLoginUseCase {
  constructor(
    @Inject(AUTH_IDENTITY_PORT)
    private readonly identity: IAuthIdentityPort,
  ) {}

  public async execute(command: IAuthLoginCommand): Promise<IAuthLoginView> {
    const { email, password } = command;
    const login = await this.identity.login({ email, password });
    const { outcome, userId, accessToken } = login;

    if (outcome === AuthIdentityLoginOutcomeEnum.USER_INACTIVE) {
      throw new AuthUserInactiveException(String(userId));
    }

    if (outcome === AuthIdentityLoginOutcomeEnum.INVALID_CREDENTIALS || !accessToken) {
      throw new AuthInvalidCredentialsException();
    }

    return { accessToken };
  }
}
