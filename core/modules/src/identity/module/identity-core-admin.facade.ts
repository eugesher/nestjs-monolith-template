import { Injectable } from '@nestjs/common';

import {
  IIdentityCoreAdminPort,
  IIdentityCoreAssignRoleCommand,
  IIdentityCoreAssignRoleView,
  IIdentityCoreRegisterUserCommand,
  IIdentityCoreRegisterUserView,
  IIdentityCoreRoleView,
  IIdentityCoreUpdateRolePermissionsCommand,
} from '@acme-core/contracts/identity';
import {
  IdentityCoreAssignRoleUseCase,
  IdentityCoreListRolesUseCase,
  IdentityCoreRegisterUserUseCase,
  IdentityCoreUpdateRolePermissionsUseCase,
} from '../application';

@Injectable()
export class IdentityCoreAdminFacade implements IIdentityCoreAdminPort {
  constructor(
    private readonly identityCoreAssignRole: IdentityCoreAssignRoleUseCase,
    private readonly identityCoreListRoles: IdentityCoreListRolesUseCase,
    private readonly identityCoreRegisterUser: IdentityCoreRegisterUserUseCase,
    private readonly identityCoreUpdateRolePermissions: IdentityCoreUpdateRolePermissionsUseCase,
  ) {}

  public registerUser(
    command: IIdentityCoreRegisterUserCommand,
  ): Promise<IIdentityCoreRegisterUserView> {
    return this.identityCoreRegisterUser.execute(command);
  }

  public assignRole(command: IIdentityCoreAssignRoleCommand): Promise<IIdentityCoreAssignRoleView> {
    return this.identityCoreAssignRole.execute(command);
  }

  public listRoles(): Promise<IIdentityCoreRoleView[]> {
    return this.identityCoreListRoles.execute();
  }

  public updateRolePermissions(
    command: IIdentityCoreUpdateRolePermissionsCommand,
  ): Promise<IIdentityCoreRoleView> {
    return this.identityCoreUpdateRolePermissions.execute(command);
  }
}
