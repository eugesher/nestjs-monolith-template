import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';

import { ICredentialsPasswordHasherPort } from '@acme-libs/contracts/credentials';
import { CredentialsPasswordHasherOptions } from './credentials-password-hasher.options';

@Injectable()
export class CredentialsPasswordHasherAdapter implements ICredentialsPasswordHasherPort {
  private readonly options: CredentialsPasswordHasherOptions;

  constructor(config: ConfigService) {
    this.options = new CredentialsPasswordHasherOptions(config);
  }

  public hash(password: string): Promise<string> {
    return hash(password, this.options);
  }

  public async verify(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
