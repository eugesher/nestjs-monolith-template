import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IStaffIdentityCommonRoleView,
  IStaffIdentityCommonUpdateRolePermissionsCommand,
} from '@acme-staff-contracts/staff-identity';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonException, StaffIdentityCommonRoleModel } from '../../domain';
import {
  STAFF_IDENTITY_COMMON_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
  type IStaffIdentityCommonUpdateRolePermissionsRepositoryPort,
} from '../../outbound';
import { StaffIdentityCommonRoleViewMapper } from '../mappers/staff-identity-common-role-view.mapper';

@Injectable()
export class StaffIdentityCommonUpdateRolePermissionsUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_COMMON_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCommonUpdateRolePermissionsRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(StaffIdentityCommonUpdateRolePermissionsUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IStaffIdentityCommonUpdateRolePermissionsCommand,
  ): Promise<IStaffIdentityCommonRoleView> {
    const role = await this.transaction.run(() => this.replace(command));

    this.logger.info(
      { role: role.name, permissionCodes: role.permissionCodes },
      'Role permissions replaced',
    );

    return StaffIdentityCommonRoleViewMapper.toView(role);
  }

  private async replace(
    command: IStaffIdentityCommonUpdateRolePermissionsCommand,
  ): Promise<StaffIdentityCommonRoleModel> {
    const { role: name, permissionCodes } = command;
    const role = await this.repository.findRole(name);

    if (!role) {
      throw new StaffIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND,
        `Role ${name} was not found`,
      );
    }

    const known = await this.repository.findPermissions(permissionCodes);

    role.replacePermissions(permissionCodes, known);

    await this.repository.replacePermissions(role);

    return role;
  }
}
