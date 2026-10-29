import { Inject, Injectable } from '@nestjs/common';

import {
  STAFF_IDENTITY_CORE_AUTH_PORT,
  type IStaffIdentityCoreAuthPort,
} from '@acme-core/contracts/staff-identity';
import {
  IAuthCurrentUserView,
  IAuthFindPermissionCodesQuery,
  IAuthFindRolesQuery,
  IAuthJwtPayloadQuery,
} from '@acme-libs/contracts/auth';
import { PermissionCodeEnum, RoleEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';

@Injectable()
export class AuthGlobalStaffIdentityCoreAdapter {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_AUTH_PORT)
    private readonly identity: IStaffIdentityCoreAuthPort,
  ) {}

  public async findSubject(query: IAuthJwtPayloadQuery): Promise<Maybe<IAuthCurrentUserView>> {
    const { sub } = query;
    const subject = await this.identity.validateSubject({ userId: sub });

    return subject ? { id: subject.id, email: subject.email } : undefined;
  }

  public async findRoles(query: IAuthFindRolesQuery): Promise<RoleEnum[]> {
    const { userId } = query;
    const subject = await this.identity.validateSubject({ userId });

    return subject?.roles ?? [];
  }

  public findPermissionCodes(query: IAuthFindPermissionCodesQuery): Promise<PermissionCodeEnum[]> {
    return this.identity.findPermissionCodes(query);
  }
}
