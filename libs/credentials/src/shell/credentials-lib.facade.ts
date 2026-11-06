import { Injectable } from '@nestjs/common';

import {
  ICredentialsLibPort,
  ICredentialsLibSignAccessTokenCommand,
  ICredentialsLibVerifyPasswordCommand,
} from '@acme-libs/contracts/credentials';

import {
  CredentialsLibHashPasswordUseCase,
  CredentialsLibSignAccessTokenUseCase,
  CredentialsLibVerifyPasswordUseCase,
} from '../application';

@Injectable()
export class CredentialsLibFacade implements ICredentialsLibPort {
  constructor(
    private readonly signAccessToken: CredentialsLibSignAccessTokenUseCase,
    private readonly hashPassword: CredentialsLibHashPasswordUseCase,
    private readonly verifyPassword: CredentialsLibVerifyPasswordUseCase,
  ) {}

  public async handleSignAccessToken(
    command: ICredentialsLibSignAccessTokenCommand,
  ): Promise<string> {
    return await this.signAccessToken.execute(command);
  }

  public async handleHashPassword(password: string): Promise<string> {
    return await this.hashPassword.execute(password);
  }

  public async handleVerifyPassword(
    command: ICredentialsLibVerifyPasswordCommand,
  ): Promise<boolean> {
    return await this.verifyPassword.execute(command);
  }
}
