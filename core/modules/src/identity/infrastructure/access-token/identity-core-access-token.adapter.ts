import { Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import {
  IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN,
  IDENTITY_CORE_ACCESS_TOKEN_SECRET,
  IIdentityCoreAccessTokenPayloadCommand,
  IIdentityCoreAccessTokenPort,
} from '../../outbound';

@Injectable()
export class IdentityCoreAccessTokenAdapter implements IIdentityCoreAccessTokenPort {
  constructor(
    @Inject(IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN)
    private readonly expiresIn: string,
    @Inject(IDENTITY_CORE_ACCESS_TOKEN_SECRET)
    private readonly secret: string,
    private readonly jwt: JwtService,
  ) {}

  public sign(payload: IIdentityCoreAccessTokenPayloadCommand): Promise<string> {
    const jti = crypto.randomUUID();

    return this.jwt.signAsync(
      { ...payload, jti },
      {
        secret: this.secret,
        expiresIn: this.expiresIn as JwtSignOptions['expiresIn'],
      },
    );
  }
}
