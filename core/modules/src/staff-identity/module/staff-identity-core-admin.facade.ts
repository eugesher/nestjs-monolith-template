import { Injectable } from '@nestjs/common';

import {
  IStaffIdentityCoreAdminPort,
  IStaffIdentityCoreAssignRoleCommand,
  IStaffIdentityCoreAssignRoleView,
  IStaffIdentityCoreRegisterUserCommand,
  IStaffIdentityCoreRegisterUserView,
  IStaffIdentityCoreRoleView,
  IStaffIdentityCoreUpdateRolePermissionsCommand,
} from '@acme-core/contracts/staff-identity';
import {
  StaffIdentityCoreAssignRoleUseCase,
  StaffIdentityCoreListRolesUseCase,
  StaffIdentityCoreRegisterUserUseCase,
  StaffIdentityCoreUpdateRolePermissionsUseCase,
} from '../application';

@Injectable()
export class StaffIdentityCoreAdminFacade implements IStaffIdentityCoreAdminPort {
  constructor(
    private readonly identityCoreAssignRole: StaffIdentityCoreAssignRoleUseCase,
    private readonly identityCoreListRoles: StaffIdentityCoreListRolesUseCase,
    private readonly identityCoreRegisterUser: StaffIdentityCoreRegisterUserUseCase,
    private readonly identityCoreUpdateRolePermissions: StaffIdentityCoreUpdateRolePermissionsUseCase,
  ) {}

  public registerUser(
    command: IStaffIdentityCoreRegisterUserCommand,
  ): Promise<IStaffIdentityCoreRegisterUserView> {
    return this.identityCoreRegisterUser.execute(command);
  }

  public assignRole(
    command: IStaffIdentityCoreAssignRoleCommand,
  ): Promise<IStaffIdentityCoreAssignRoleView> {
    return this.identityCoreAssignRole.execute(command);
  }

  public listRoles(): Promise<IStaffIdentityCoreRoleView[]> {
    return this.identityCoreListRoles.execute();
  }

  public updateRolePermissions(
    command: IStaffIdentityCoreUpdateRolePermissionsCommand,
  ): Promise<IStaffIdentityCoreRoleView> {
    return this.identityCoreUpdateRolePermissions.execute(command);
  }
}
