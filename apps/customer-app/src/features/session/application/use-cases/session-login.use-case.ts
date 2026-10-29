import { Inject, Injectable } from '@nestjs/common';

import { type ISessionIdentityPort, SESSION_IDENTITY_PORT } from '../../outbound';
import { ISessionLoginCommand, ISessionTokenPairView } from '../interfaces';

@Injectable()
export class SessionLoginUseCase {
  constructor(
    @Inject(SESSION_IDENTITY_PORT)
    private readonly identity: ISessionIdentityPort,
  ) {}

  public execute(command: ISessionLoginCommand): Promise<ISessionTokenPairView> {
    const { email, password } = command;

    return this.identity.login({ email, password });
  }
}
