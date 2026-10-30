import { Inject, Injectable } from '@nestjs/common';

import {
  CUSTOMER_IDENTITY_COMMON_AUTH_PORT,
  type ICustomerIdentityCommonAuthPort,
} from '@acme-customer-contracts/customer-identity';
import { IAuthCurrentUserView, IAuthJwtPayloadQuery } from '@acme-libs/contracts/auth';
import { Maybe } from '@acme-libs/toolkit';

@Injectable()
export class AuthGlobalCustomerIdentityCommonAdapter {
  constructor(
    @Inject(CUSTOMER_IDENTITY_COMMON_AUTH_PORT)
    private readonly identity: ICustomerIdentityCommonAuthPort,
  ) {}

  public findSubject(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    const { sub } = query;

    return this.identity.validateSubject({ customerId: sub });
  }
}
