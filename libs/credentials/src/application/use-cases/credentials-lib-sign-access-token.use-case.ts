import { Inject, Injectable } from '@nestjs/common';

import type { ICredentialsLibSignAccessTokenCommand } from '@acme-libs/contracts/credentials';

import {
  CREDENTIALS_LIB_ACCESS_TOKEN_PORT,
  type ICredentialsLibAccessTokenPort,
} from '../../outbound';

@Injectable()
export class CredentialsLibSignAccessTokenUseCase {
  constructor(
    @Inject(CREDENTIALS_LIB_ACCESS_TOKEN_PORT)
    private readonly accessToken: ICredentialsLibAccessTokenPort,
  ) {}

  public async execute(command: ICredentialsLibSignAccessTokenCommand): Promise<string> {
    return await this.accessToken.sign(command);
  }
}
