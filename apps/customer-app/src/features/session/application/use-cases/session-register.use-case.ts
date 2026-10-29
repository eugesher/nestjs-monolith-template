import { Inject, Injectable } from '@nestjs/common';

import { type ISessionIdentityPort, SESSION_IDENTITY_PORT } from '../../outbound';
import { ISessionRegisterCommand, ISessionRegisterView } from '../interfaces';

@Injectable()
export class SessionRegisterUseCase {
  constructor(
    @Inject(SESSION_IDENTITY_PORT)
    private readonly identity: ISessionIdentityPort,
  ) {}

  public execute(command: ISessionRegisterCommand): Promise<ISessionRegisterView> {
    const { email, password } = command;

    return this.identity.register({ email, password });
  }
}
