import { Inject, Injectable } from '@nestjs/common';

import { type ISessionIdentityPort, SESSION_IDENTITY_PORT } from '../../outbound';
import { ISessionRefreshCommand, ISessionTokenPairView } from '../interfaces';

@Injectable()
export class SessionRefreshUseCase {
  constructor(
    @Inject(SESSION_IDENTITY_PORT)
    private readonly identity: ISessionIdentityPort,
  ) {}

  public execute(command: ISessionRefreshCommand): Promise<ISessionTokenPairView> {
    const { refreshToken } = command;

    return this.identity.refresh({ refreshToken });
  }
}
