import { Inject, Injectable } from '@nestjs/common';

import { type IAuthIdentityPort, AUTH_IDENTITY_PORT } from '../../outbound';
import { IAuthLoginCommand, IAuthAccessTokenView } from '../interfaces';

@Injectable()
export class AuthLoginUseCase {
  constructor(
    @Inject(AUTH_IDENTITY_PORT)
    private readonly identity: IAuthIdentityPort,
  ) {}

  public execute(command: IAuthLoginCommand): Promise<IAuthAccessTokenView> {
    const { email, password } = command;

    return this.identity.login({ email, password });
  }
}
