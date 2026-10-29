import { Injectable } from '@nestjs/common';

import {
  IAuthCurrentUserView,
  IAuthJwtPayloadQuery,
  IAuthUserValidatorPort,
} from '@acme-libs/contracts/auth';
import { Maybe } from '@acme-libs/toolkit';
import { AuthStaffIdentityCoreAdapter } from '../infrastructure';

@Injectable()
export class AuthFacade implements IAuthUserValidatorPort {
  constructor(private readonly identity: AuthStaffIdentityCoreAdapter) {}

  public validate(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    return this.identity.findSubject(query);
  }
}
