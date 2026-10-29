import { Inject, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import {
  STAFF_IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN,
  STAFF_IDENTITY_CORE_ACCESS_TOKEN_SECRET,
  IStaffIdentityCoreAccessTokenPayloadCommand,
  IStaffIdentityCoreAccessTokenPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCoreAccessTokenAdapter implements IStaffIdentityCoreAccessTokenPort {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_ACCESS_TOKEN_EXPIRES_IN)
    private readonly expiresIn: string,
    @Inject(STAFF_IDENTITY_CORE_ACCESS_TOKEN_SECRET)
    private readonly secret: string,
    private readonly jwt: JwtService,
  ) {}

  public sign(payload: IStaffIdentityCoreAccessTokenPayloadCommand): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.secret,
      expiresIn: this.expiresIn as JwtSignOptions['expiresIn'],
    });
  }
}
