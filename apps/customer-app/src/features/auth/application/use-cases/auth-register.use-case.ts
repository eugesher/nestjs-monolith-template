import { Inject, Injectable } from '@nestjs/common';

import { type IAuthIdentityPort, AUTH_IDENTITY_PORT } from '../../outbound';
import { IAuthRegisterCommand, IAuthRegisterView } from '../interfaces';

@Injectable()
export class AuthRegisterUseCase {
  constructor(
    @Inject(AUTH_IDENTITY_PORT)
    private readonly identity: IAuthIdentityPort,
  ) {}

  public execute(command: IAuthRegisterCommand): Promise<IAuthRegisterView> {
    const { email, password } = command;

    return this.identity.register({ email, password });
  }
}
