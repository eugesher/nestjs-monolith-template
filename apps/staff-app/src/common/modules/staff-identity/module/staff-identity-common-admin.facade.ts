import { Injectable } from '@nestjs/common';

import {
  IStaffIdentityCommonAdminPort,
  IStaffIdentityCommonAssignRoleCommand,
  IStaffIdentityCommonAssignRoleView,
  IStaffIdentityCommonRegisterUserCommand,
  IStaffIdentityCommonRegisterUserView,
  IStaffIdentityCommonRoleView,
  IStaffIdentityCommonUpdateRolePermissionsCommand,
} from '@acme-staff-contracts/staff-identity';
import {
  StaffIdentityCommonAssignRoleUseCase,
  StaffIdentityCommonListRolesUseCase,
  StaffIdentityCommonRegisterUserUseCase,
  StaffIdentityCommonUpdateRolePermissionsUseCase,
} from '../application';

@Injectable()
export class StaffIdentityCommonAdminFacade implements IStaffIdentityCommonAdminPort {
  constructor(
    private readonly identityCoreAssignRole: StaffIdentityCommonAssignRoleUseCase,
    private readonly identityCoreListRoles: StaffIdentityCommonListRolesUseCase,
    private readonly identityCoreRegisterUser: StaffIdentityCommonRegisterUserUseCase,
    private readonly identityCoreUpdateRolePermissions: StaffIdentityCommonUpdateRolePermissionsUseCase,
  ) {}

  public registerUser(
    command: IStaffIdentityCommonRegisterUserCommand,
  ): Promise<IStaffIdentityCommonRegisterUserView> {
    return this.identityCoreRegisterUser.execute(command);
  }

  public assignRole(
    command: IStaffIdentityCommonAssignRoleCommand,
  ): Promise<IStaffIdentityCommonAssignRoleView> {
    return this.identityCoreAssignRole.execute(command);
  }

  public listRoles(): Promise<IStaffIdentityCommonRoleView[]> {
    return this.identityCoreListRoles.execute();
  }

  public updateRolePermissions(
    command: IStaffIdentityCommonUpdateRolePermissionsCommand,
  ): Promise<IStaffIdentityCommonRoleView> {
    return this.identityCoreUpdateRolePermissions.execute(command);
  }
}
