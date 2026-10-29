import { Inject, Injectable } from '@nestjs/common';

import {
  CUSTOMER_IDENTITY_CORE_AUTH_PORT,
  type ICustomerIdentityCoreAuthPort,
} from '@acme-core/contracts/customer-identity';
import { IAuthCurrentUserView, IAuthJwtPayloadQuery } from '@acme-libs/contracts/auth';
import { Maybe } from '@acme-libs/toolkit';

@Injectable()
export class AuthGlobalCustomerIdentityCoreAdapter {
  constructor(
    @Inject(CUSTOMER_IDENTITY_CORE_AUTH_PORT)
    private readonly identity: ICustomerIdentityCoreAuthPort,
  ) {}

  public findSubject(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    const { sub } = query;

    return this.identity.validateSubject({ customerId: sub });
  }
}
