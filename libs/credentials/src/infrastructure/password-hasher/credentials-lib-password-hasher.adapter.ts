import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';

import { ICredentialsLibVerifyPasswordCommand } from '@acme-libs/contracts/credentials';

import { ICredentialsLibPasswordHasherPort } from '../../outbound';
import { CredentialsLibPasswordHasherOptions } from './credentials-lib-password-hasher.options';

@Injectable()
export class CredentialsLibPasswordHasherAdapter implements ICredentialsLibPasswordHasherPort {
  private readonly options: CredentialsLibPasswordHasherOptions;

  constructor(config: ConfigService) {
    this.options = new CredentialsLibPasswordHasherOptions(config);
  }

  public async hash(password: string): Promise<string> {
    return await hash(password, this.options);
  }

  public async verify(command: ICredentialsLibVerifyPasswordCommand): Promise<boolean> {
    const { passwordHash, password } = command;

    try {
      return await verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
