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
    private readonly credentialsLibSignAccessToken: CredentialsLibSignAccessTokenUseCase,
    private readonly credentialsLibHashPassword: CredentialsLibHashPasswordUseCase,
    private readonly credentialsLibVerifyPassword: CredentialsLibVerifyPasswordUseCase,
  ) {}

  public async signAccessToken(command: ICredentialsLibSignAccessTokenCommand): Promise<string> {
    return await this.credentialsLibSignAccessToken.execute(command);
  }

  public async hashPassword(password: string): Promise<string> {
    return await this.credentialsLibHashPassword.execute(password);
  }

  public async verifyPassword(command: ICredentialsLibVerifyPasswordCommand): Promise<boolean> {
    return await this.credentialsLibVerifyPassword.execute(command);
  }
}
