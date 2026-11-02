import { Inject, Injectable } from '@nestjs/common';

import { ICredentialsLibVerifyPasswordCommand } from '@acme-libs/contracts/credentials';

import {
  CREDENTIALS_LIB_PASSWORD_HASHER_PORT,
  type ICredentialsLibPasswordHasherPort,
} from '../../outbound';

@Injectable()
export class CredentialsLibVerifyPasswordUseCase {
  constructor(
    @Inject(CREDENTIALS_LIB_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsLibPasswordHasherPort,
  ) {}

  public async execute(command: ICredentialsLibVerifyPasswordCommand): Promise<boolean> {
    return await this.passwordHasher.verify(command);
  }
}
