import { Injectable } from '@nestjs/common';

import {
  IAuthCurrentUserView,
  IAuthJwtPayloadQuery,
  IAuthUserValidatorPort,
} from '@acme-libs/contracts/auth';
import { Maybe } from '@acme-libs/toolkit';
import { AuthGlobalCustomerIdentityCoreAdapter } from '../infrastructure';

@Injectable()
export class AuthGlobalFacade implements IAuthUserValidatorPort {
  constructor(private readonly identity: AuthGlobalCustomerIdentityCoreAdapter) {}

  public validate(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    return this.identity.findSubject(query);
  }
}
