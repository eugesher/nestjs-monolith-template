import { Inject, Injectable } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT, type ICredentialsLibPort } from '@acme-libs/contracts/credentials';

import { IAuthAccessTokenPort } from '../../outbound';

@Injectable()
export class AuthAccessTokenLibAdapter implements IAuthAccessTokenPort {
  constructor(
    @Inject(CREDENTIALS_LIB_PORT)
    private readonly credentials: ICredentialsLibPort,
  ) {}

  public async issue(customerId: string): Promise<string> {
    return await this.credentials.signAccessToken({ sub: customerId });
  }
}
