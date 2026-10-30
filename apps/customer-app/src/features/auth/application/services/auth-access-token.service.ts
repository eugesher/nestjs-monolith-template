import { Inject, Injectable } from '@nestjs/common';

import {
  CREDENTIALS_ACCESS_TOKEN_PORT,
  type ICredentialsAccessTokenPort,
} from '@acme-libs/contracts/credentials';
import { AuthCustomerModel } from '../../domain';
import { IAuthAccessTokenView } from '../interfaces';

@Injectable()
export class AuthAccessTokenService {
  constructor(
    @Inject(CREDENTIALS_ACCESS_TOKEN_PORT)
    private readonly accessToken: ICredentialsAccessTokenPort,
  ) {}

  public async issue(customer: AuthCustomerModel): Promise<IAuthAccessTokenView> {
    const payload = { sub: customer.id };
    const accessToken = await this.accessToken.sign(payload);

    return { accessToken };
  }
}
