import { Inject, Injectable } from '@nestjs/common';

import {
  IDENTITY_CORE_ADMIN_PORT,
  type IIdentityCoreAdminPort,
} from '@acme-core/contracts/identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { DomainException } from '@acme-libs/toolkit';
import { IamDomainException } from '../../domain';
import {
  IIamIdentityAssignRoleCommand,
  IIamIdentityPort,
  IIamIdentityRegisterUserCommand,
  IIamIdentityRoleView,
  IIamIdentityUpdateRolePermissionsCommand,
  IIamIdentityUserRolesView,
  IIamIdentityUserView,
} from '../../outbound';

@Injectable()
export class IamIdentityCoreAdapter implements IIamIdentityPort {
  constructor(
    @Inject(IDENTITY_CORE_ADMIN_PORT)
    private readonly identity: IIdentityCoreAdminPort,
  ) {}

  public async registerUser(
    command: IIamIdentityRegisterUserCommand,
  ): Promise<IIamIdentityUserView> {
    const { email, password, roles } = command;

    try {
      return await this.identity.registerUser({ email, password, roles });
    } catch (error) {
      throw IamIdentityCoreAdapter.translate(error);
    }
  }

  public async assignRole(
    command: IIamIdentityAssignRoleCommand,
  ): Promise<IIamIdentityUserRolesView> {
    const { userId, role } = command;

    try {
      return await this.identity.assignRole({ userId, role });
    } catch (error) {
      throw IamIdentityCoreAdapter.translate(error);
    }
  }

  public listRoles(): Promise<IIamIdentityRoleView[]> {
    return this.identity.listRoles();
  }

  public async updateRolePermissions(
    command: IIamIdentityUpdateRolePermissionsCommand,
  ): Promise<IIamIdentityRoleView> {
    const { role, permissionCodes } = command;

    try {
      return await this.identity.updateRolePermissions({ role, permissionCodes });
    } catch (error) {
      throw IamIdentityCoreAdapter.translate(error);
    }
  }

  private static translate(error: unknown): unknown {
    if (error instanceof DomainException && IamIdentityCoreAdapter.isIdentityCode(error.code)) {
      return new IamDomainException(error.code, error.message);
    }

    return error;
  }

  private static isIdentityCode(code: string): code is IdentityErrorCodeEnum {
    return Object.values<string>(IdentityErrorCodeEnum).includes(code);
  }
}
