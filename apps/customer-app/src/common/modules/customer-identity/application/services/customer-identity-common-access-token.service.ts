import { Inject, Injectable } from '@nestjs/common';

import { ICustomerIdentityCommonAccessTokenView } from '@acme-customer-contracts/customer-identity';
import {
  CREDENTIALS_ACCESS_TOKEN_PORT,
  type ICredentialsAccessTokenPort,
} from '@acme-libs/contracts/credentials';
import { CustomerIdentityCommonCustomerModel } from '../../domain';

@Injectable()
export class CustomerIdentityCommonAccessTokenService {
  constructor(
    @Inject(CREDENTIALS_ACCESS_TOKEN_PORT)
    private readonly accessToken: ICredentialsAccessTokenPort,
  ) {}

  public async issue(
    customer: CustomerIdentityCommonCustomerModel,
  ): Promise<ICustomerIdentityCommonAccessTokenView> {
    const payload = { sub: customer.id };
    const accessToken = await this.accessToken.sign(payload);

    return { accessToken };
  }
}
