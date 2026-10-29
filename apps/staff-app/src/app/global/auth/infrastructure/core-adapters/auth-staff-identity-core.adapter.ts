import { Inject, Injectable } from '@nestjs/common';

import {
  STAFF_IDENTITY_CORE_SESSION_PORT,
  type IStaffIdentityCoreSessionPort,
} from '@acme-core/contracts/staff-identity';
import {
  IAuthCurrentUserView,
  IAuthFindPermissionCodesQuery,
  IAuthJwtPayloadQuery,
} from '@acme-libs/contracts/auth';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';

@Injectable()
export class AuthStaffIdentityCoreAdapter {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_SESSION_PORT)
    private readonly identity: IStaffIdentityCoreSessionPort,
  ) {}

  public findSubject(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    const { sub } = query;

    return this.identity.validateSubject({ userId: sub });
  }

  public findPermissionCodes(query: IAuthFindPermissionCodesQuery): Promise<PermissionCodeEnum[]> {
    return this.identity.findPermissionCodes(query);
  }
}
