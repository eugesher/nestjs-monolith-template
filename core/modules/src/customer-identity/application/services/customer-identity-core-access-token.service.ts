import { Inject, Injectable } from '@nestjs/common';

import { ICustomerIdentityCoreAccessTokenView } from '@acme-core/contracts/customer-identity';
import {
  CREDENTIALS_ACCESS_TOKEN_PORT,
  type ICredentialsAccessTokenPort,
} from '@acme-libs/contracts/credentials';
import { CustomerIdentityCoreCustomerModel } from '../../domain';

@Injectable()
export class CustomerIdentityCoreAccessTokenService {
  constructor(
    @Inject(CREDENTIALS_ACCESS_TOKEN_PORT)
    private readonly accessToken: ICredentialsAccessTokenPort,
  ) {}

  public async issue(
    customer: CustomerIdentityCoreCustomerModel,
  ): Promise<ICustomerIdentityCoreAccessTokenView> {
    const payload = { sub: customer.id };
    const accessToken = await this.accessToken.sign(payload);

    return { accessToken };
  }
}
