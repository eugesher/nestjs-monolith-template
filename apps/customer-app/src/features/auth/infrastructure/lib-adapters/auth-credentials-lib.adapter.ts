import { Inject, Injectable } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT, type ICredentialsLibPort } from '@acme-libs/contracts/credentials';

import { IAuthCredentialsPort, IAuthCredentialsVerifyPasswordCommand } from '../../outbound';

@Injectable()
export class AuthCredentialsLibAdapter implements IAuthCredentialsPort {
  constructor(
    @Inject(CREDENTIALS_LIB_PORT)
    private readonly credentials: ICredentialsLibPort,
  ) {}

  public async issueAccessToken(customerId: string): Promise<string> {
    return await this.credentials.handleSignAccessToken({ sub: customerId });
  }

  public async hashPassword(password: string): Promise<string> {
    return await this.credentials.handleHashPassword(password);
  }

  public async verifyPassword(command: IAuthCredentialsVerifyPasswordCommand): Promise<boolean> {
    const { passwordHash, password } = command;

    return await this.credentials.handleVerifyPassword({ passwordHash, password });
  }
}
