import { Injectable } from '@nestjs/common';

import {
  IAuthCurrentUserView,
  IAuthFindPermissionCodesQuery,
  IAuthJwtPayloadQuery,
  IAuthUserValidatorPort,
} from '@acme-libs/contracts/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import { AuthIdentityCoreAdapter } from '../infrastructure';

@Injectable()
export class AuthFacade implements IAuthUserValidatorPort {
  constructor(private readonly identity: AuthIdentityCoreAdapter) {}

  public validate(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    return this.identity.findSubject(query);
  }

  public findPermissionCodes(query: IAuthFindPermissionCodesQuery): Promise<PermissionCodeEnum[]> {
    return this.identity.findPermissionCodes(query);
  }
}
