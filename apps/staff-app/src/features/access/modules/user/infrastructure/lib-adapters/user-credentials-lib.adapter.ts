import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { CREDENTIALS_LIB_PORT, type ICredentialsLibPort } from '@acme-libs/contracts/credentials';

import { IUserCredentialsPort, USER_CREDENTIALS_PORT } from '../../outbound';

@Injectable()
export class UserCredentialsLibAdapter implements IUserCredentialsPort {
  public static readonly provider: ClassProvider<IUserCredentialsPort> = {
    provide: USER_CREDENTIALS_PORT,
    useClass: UserCredentialsLibAdapter,
  };

  constructor(
    @Inject(CREDENTIALS_LIB_PORT)
    private readonly credentials: ICredentialsLibPort,
  ) {}

  public async hashPassword(password: string): Promise<string> {
    return await this.credentials.handleHashPassword(password);
  }
}
