import { Inject, Injectable } from '@nestjs/common';

import {
  CUSTOMER_IDENTITY_CORE_SESSION_PORT,
  type ICustomerIdentityCoreSessionPort,
} from '@acme-core/contracts/customer-identity';
import { IAuthCurrentUserView, IAuthJwtPayloadQuery } from '@acme-libs/contracts/auth';
import { Maybe } from '@acme-libs/toolkit';

@Injectable()
export class AuthCustomerIdentityCoreAdapter {
  constructor(
    @Inject(CUSTOMER_IDENTITY_CORE_SESSION_PORT)
    private readonly identity: ICustomerIdentityCoreSessionPort,
  ) {}

  public findSubject(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    const { sub } = query;

    return this.identity.validateSubject({ customerId: sub });
  }
}
