import { Injectable } from '@nestjs/common';

import {
  IStaffIdentityCoreAccessTokenView,
  IStaffIdentityCoreFindPermissionCodesQuery,
  IStaffIdentityCoreLoginCommand,
  IStaffIdentityCoreSessionPort,
  IStaffIdentityCoreSubjectView,
  IStaffIdentityCoreValidateSubjectQuery,
} from '@acme-core/contracts/staff-identity';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import {
  StaffIdentityCoreFindPermissionCodesUseCase,
  StaffIdentityCoreLoginUseCase,
  StaffIdentityCoreValidateSubjectUseCase,
} from '../application';

@Injectable()
export class StaffIdentityCoreSessionFacade implements IStaffIdentityCoreSessionPort {
  constructor(
    private readonly identityCoreFindPermissionCodes: StaffIdentityCoreFindPermissionCodesUseCase,
    private readonly identityCoreLogin: StaffIdentityCoreLoginUseCase,
    private readonly identityCoreValidateSubject: StaffIdentityCoreValidateSubjectUseCase,
  ) {}

  public login(
    command: IStaffIdentityCoreLoginCommand,
  ): Promise<IStaffIdentityCoreAccessTokenView> {
    return this.identityCoreLogin.execute(command);
  }

  public validateSubject(
    query: IStaffIdentityCoreValidateSubjectQuery,
  ): Promise<Maybe<IStaffIdentityCoreSubjectView>> {
    return this.identityCoreValidateSubject.execute(query);
  }

  public findPermissionCodes(
    query: IStaffIdentityCoreFindPermissionCodesQuery,
  ): Promise<PermissionCodeEnum[]> {
    return this.identityCoreFindPermissionCodes.execute(query);
  }
}
