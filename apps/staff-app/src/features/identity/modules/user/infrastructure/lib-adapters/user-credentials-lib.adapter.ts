import { Inject, Injectable } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT, type ICredentialsLibPort } from '@acme-libs/contracts/credentials';

import { IUserCredentialsPort } from '../../outbound';

@Injectable()
export class UserCredentialsLibAdapter implements IUserCredentialsPort {
  constructor(
    @Inject(CREDENTIALS_LIB_PORT)
    private readonly credentials: ICredentialsLibPort,
  ) {}

  public async hashPassword(password: string): Promise<string> {
    return await this.credentials.handleHashPassword(password);
  }
}
