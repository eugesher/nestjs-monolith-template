import { Injectable } from '@nestjs/common';

import {
  IStaffIdentityCommonAccessTokenView,
  IStaffIdentityCommonFindPermissionCodesQuery,
  IStaffIdentityCommonLoginCommand,
  IStaffIdentityCommonAuthPort,
  IStaffIdentityCommonSubjectView,
  IStaffIdentityCommonValidateSubjectQuery,
} from '@acme-staff-contracts/staff-identity';
import { PermissionCodeEnum } from '@acme-libs/kernel';
import { Maybe } from '@acme-libs/toolkit';
import {
  StaffIdentityCommonFindPermissionCodesUseCase,
  StaffIdentityCommonLoginUseCase,
  StaffIdentityCommonValidateSubjectUseCase,
} from '../application';

@Injectable()
export class StaffIdentityCommonAuthFacade implements IStaffIdentityCommonAuthPort {
  constructor(
    private readonly identityCoreFindPermissionCodes: StaffIdentityCommonFindPermissionCodesUseCase,
    private readonly identityCoreLogin: StaffIdentityCommonLoginUseCase,
    private readonly identityCoreValidateSubject: StaffIdentityCommonValidateSubjectUseCase,
  ) {}

  public login(
    command: IStaffIdentityCommonLoginCommand,
  ): Promise<IStaffIdentityCommonAccessTokenView> {
    return this.identityCoreLogin.execute(command);
  }

  public validateSubject(
    query: IStaffIdentityCommonValidateSubjectQuery,
  ): Promise<Maybe<IStaffIdentityCommonSubjectView>> {
    return this.identityCoreValidateSubject.execute(query);
  }

  public findPermissionCodes(
    query: IStaffIdentityCommonFindPermissionCodesQuery,
  ): Promise<PermissionCodeEnum[]> {
    return this.identityCoreFindPermissionCodes.execute(query);
  }
}
