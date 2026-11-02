import { Inject, Injectable } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT, type ICredentialsLibPort } from '@acme-libs/contracts/credentials';

import { IUserPasswordHasherPort } from '../../outbound';

@Injectable()
export class UserPasswordHasherLibAdapter implements IUserPasswordHasherPort {
  constructor(
    @Inject(CREDENTIALS_LIB_PORT)
    private readonly credentials: ICredentialsLibPort,
  ) {}

  public async hash(password: string): Promise<string> {
    return await this.credentials.hashPassword(password);
  }
}
