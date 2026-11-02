import { Inject, Injectable } from '@nestjs/common';

import {
  CREDENTIALS_LIB_PASSWORD_HASHER_PORT,
  type ICredentialsLibPasswordHasherPort,
} from '../../outbound';

@Injectable()
export class CredentialsLibHashPasswordUseCase {
  constructor(
    @Inject(CREDENTIALS_LIB_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsLibPasswordHasherPort,
  ) {}

  public async execute(password: string): Promise<string> {
    return await this.passwordHasher.hash(password);
  }
}
