import { Injectable, type ClassProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, verify } from 'argon2';

import type { ICredentialsLibVerifyPasswordCommand } from '@acme-libs/contracts/credentials';

import {
  CREDENTIALS_LIB_PASSWORD_HASHER_PORT,
  type ICredentialsLibPasswordHasherPort,
} from '../../outbound';
import { CredentialsLibPasswordHasherOptions } from './credentials-lib-password-hasher.options';
import { CredentialsLibPasswordHasherSemaphore } from './credentials-lib-password-hasher.semaphore';

@Injectable()
export class CredentialsLibPasswordHasherAdapter implements ICredentialsLibPasswordHasherPort {
  public static readonly provider: ClassProvider<ICredentialsLibPasswordHasherPort> = {
    provide: CREDENTIALS_LIB_PASSWORD_HASHER_PORT,
    useClass: CredentialsLibPasswordHasherAdapter,
  };

  private static readonly DUMMY_PASSWORD = 'dummy-password-of-an-unknown-user';

  private readonly options: CredentialsLibPasswordHasherOptions;
  private readonly semaphore: CredentialsLibPasswordHasherSemaphore;
  private readonly dummyHash: Promise<string>;

  constructor(config: ConfigService) {
    this.options = new CredentialsLibPasswordHasherOptions(config);
    this.semaphore = new CredentialsLibPasswordHasherSemaphore(config);
    this.dummyHash = hash(CredentialsLibPasswordHasherAdapter.DUMMY_PASSWORD, this.options);
  }

  public async hash(password: string): Promise<string> {
    return await this.semaphore.run(() => hash(password, this.options));
  }

  public async verify(command: ICredentialsLibVerifyPasswordCommand): Promise<boolean> {
    return await this.semaphore.run(() => this.verifyHash(command));
  }

  private async verifyHash(command: ICredentialsLibVerifyPasswordCommand): Promise<boolean> {
    const { passwordHash, password } = command;
    const checkedHash = passwordHash ?? (await this.dummyHash);

    try {
      const isPasswordValid = await verify(checkedHash, password);

      return isPasswordValid && passwordHash !== null;
    } catch {
      return false;
    }
  }
}
