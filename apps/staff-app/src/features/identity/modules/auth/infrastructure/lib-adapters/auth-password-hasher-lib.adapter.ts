import { Inject, Injectable } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT, type ICredentialsLibPort } from '@acme-libs/contracts/credentials';

import { IAuthPasswordHasherPort, IAuthPasswordVerifyCommand } from '../../outbound';

@Injectable()
export class AuthPasswordHasherLibAdapter implements IAuthPasswordHasherPort {
  constructor(
    @Inject(CREDENTIALS_LIB_PORT)
    private readonly credentials: ICredentialsLibPort,
  ) {}

  public async verify(command: IAuthPasswordVerifyCommand): Promise<boolean> {
    const { passwordHash, password } = command;

    return await this.credentials.verifyPassword({ passwordHash, password });
  }
}
