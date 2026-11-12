import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT, type ICredentialsLibPort } from '@acme-libs/contracts/credentials';

import {
  STAFF_AUTH_CORE_CREDENTIALS_PORT,
  type IStaffAuthCoreCredentialsPort,
  type IStaffAuthCoreCredentialsVerifyPasswordCommand,
} from '../../outbound';

@Injectable()
export class StaffAuthCoreCredentialsLibAdapter implements IStaffAuthCoreCredentialsPort {
  public static readonly provider: ClassProvider<IStaffAuthCoreCredentialsPort> = {
    provide: STAFF_AUTH_CORE_CREDENTIALS_PORT,
    useClass: StaffAuthCoreCredentialsLibAdapter,
  };

  constructor(
    @Inject(CREDENTIALS_LIB_PORT)
    private readonly credentials: ICredentialsLibPort,
  ) {}

  public async issueAccessToken(userId: string): Promise<string> {
    return await this.credentials.handleSignAccessToken({ sub: userId });
  }

  public async verifyPassword(
    command: IStaffAuthCoreCredentialsVerifyPasswordCommand,
  ): Promise<boolean> {
    const { passwordHash, password } = command;

    return await this.credentials.handleVerifyPassword({ passwordHash, password });
  }
}
