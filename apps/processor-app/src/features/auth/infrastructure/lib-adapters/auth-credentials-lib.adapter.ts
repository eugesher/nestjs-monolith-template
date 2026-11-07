import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT, type ICredentialsLibPort } from '@acme-libs/contracts/credentials';

import {
  AUTH_CREDENTIALS_PORT,
  IAuthCredentialsPort,
  IAuthCredentialsVerifyPasswordCommand,
} from '../../outbound';

@Injectable()
export class AuthCredentialsLibAdapter implements IAuthCredentialsPort {
  public static readonly provider: ClassProvider<IAuthCredentialsPort> = {
    provide: AUTH_CREDENTIALS_PORT,
    useClass: AuthCredentialsLibAdapter,
  };

  constructor(
    @Inject(CREDENTIALS_LIB_PORT)
    private readonly credentials: ICredentialsLibPort,
  ) {}

  public async issueAccessToken(userId: string): Promise<string> {
    return await this.credentials.handleSignAccessToken({ sub: userId });
  }

  public async verifyPassword(command: IAuthCredentialsVerifyPasswordCommand): Promise<boolean> {
    const { passwordHash, password } = command;

    return await this.credentials.handleVerifyPassword({ passwordHash, password });
  }
}
