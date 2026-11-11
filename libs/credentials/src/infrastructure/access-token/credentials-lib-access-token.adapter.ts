import { Injectable, type ClassProvider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { ICredentialsLibSignAccessTokenCommand } from '@acme-libs/contracts/credentials';

import {
  CREDENTIALS_LIB_ACCESS_TOKEN_PORT,
  type ICredentialsLibAccessTokenPort,
} from '../../outbound';

@Injectable()
export class CredentialsLibAccessTokenAdapter implements ICredentialsLibAccessTokenPort {
  public static readonly provider: ClassProvider<ICredentialsLibAccessTokenPort> = {
    provide: CREDENTIALS_LIB_ACCESS_TOKEN_PORT,
    useClass: CredentialsLibAccessTokenAdapter,
  };

  constructor(private readonly jwt: JwtService) {}

  public async sign(command: ICredentialsLibSignAccessTokenCommand): Promise<string> {
    const { sub } = command;

    return await this.jwt.signAsync({ sub });
  }
}
