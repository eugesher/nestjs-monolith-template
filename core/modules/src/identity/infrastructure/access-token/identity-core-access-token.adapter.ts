import { Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { Maybe } from '@acme-libs/toolkit';
import {
  IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN,
  IDENTITY_CORE_ACCESS_TOKEN_SECRET,
  IDENTITY_CORE_REFRESH_TOKEN_EXPIRES_IN,
  IDENTITY_CORE_REFRESH_TOKEN_SECRET,
  IIdentityCoreAccessTokenPayloadCommand,
  IIdentityCoreAccessTokenPort,
} from '../../outbound';

@Injectable()
export class IdentityCoreAccessTokenAdapter implements IIdentityCoreAccessTokenPort {
  constructor(
    @Inject(IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN)
    private readonly accessExpiresIn: string,
    @Inject(IDENTITY_CORE_ACCESS_TOKEN_SECRET)
    private readonly accessSecret: string,
    @Inject(IDENTITY_CORE_REFRESH_TOKEN_EXPIRES_IN)
    private readonly refreshExpiresIn: string,
    @Inject(IDENTITY_CORE_REFRESH_TOKEN_SECRET)
    private readonly refreshSecret: string,
    private readonly jwt: JwtService,
  ) {}

  public signAccess(payload: IIdentityCoreAccessTokenPayloadCommand): Promise<string> {
    const jti = crypto.randomUUID();

    return this.jwt.signAsync(
      { ...payload, jti },
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresIn as JwtSignOptions['expiresIn'],
      },
    );
  }

  public signRefresh(userId: string): Promise<string> {
    const jti = crypto.randomUUID();

    return this.jwt.signAsync(
      { sub: userId, jti },
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn as JwtSignOptions['expiresIn'],
      },
    );
  }

  public async verifyRefresh(refreshToken: string): Promise<Maybe<string>> {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.refreshSecret,
      });

      return payload.sub;
    } catch {
      return undefined;
    }
  }
}
