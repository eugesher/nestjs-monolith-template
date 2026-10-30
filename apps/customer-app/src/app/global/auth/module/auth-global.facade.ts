import { Injectable } from '@nestjs/common';

import {
  IAuthCurrentUserView,
  IAuthJwtPayloadQuery,
  IAuthUserValidatorPort,
} from '@acme-libs/contracts/auth';
import { Maybe } from '@acme-libs/toolkit';
import { AuthGlobalCustomerIdentityCommonAdapter } from '../infrastructure';

@Injectable()
export class AuthGlobalFacade implements IAuthUserValidatorPort {
  constructor(private readonly identity: AuthGlobalCustomerIdentityCommonAdapter) {}

  public validate(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    return this.identity.findSubject(query);
  }
}
