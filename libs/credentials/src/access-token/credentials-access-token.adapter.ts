import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  ICredentialsAccessTokenPayloadCommand,
  ICredentialsAccessTokenPort,
} from '@acme-libs/contracts/credentials';

@Injectable()
export class CredentialsAccessTokenAdapter implements ICredentialsAccessTokenPort {
  constructor(private readonly jwt: JwtService) {}

  public async sign(payload: ICredentialsAccessTokenPayloadCommand): Promise<string> {
    const { sub } = payload;

    return await this.jwt.signAsync({ sub });
  }
}
