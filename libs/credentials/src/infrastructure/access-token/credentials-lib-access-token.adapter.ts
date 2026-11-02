import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ICredentialsLibSignAccessTokenCommand } from '@acme-libs/contracts/credentials';

import { ICredentialsLibAccessTokenPort } from '../../outbound';

@Injectable()
export class CredentialsLibAccessTokenAdapter implements ICredentialsLibAccessTokenPort {
  constructor(private readonly jwt: JwtService) {}

  public async sign(command: ICredentialsLibSignAccessTokenCommand): Promise<string> {
    const { sub } = command;

    return await this.jwt.signAsync({ sub });
  }
}
