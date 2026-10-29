import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IStaffIdentityCoreRoleView,
  IStaffIdentityCoreUpdateRolePermissionsCommand,
} from '@acme-core/contracts/staff-identity';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreException, StaffIdentityCoreRoleModel } from '../../domain';
import {
  STAFF_IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
  type IStaffIdentityCoreUpdateRolePermissionsRepositoryPort,
} from '../../outbound';
import { StaffIdentityCoreRoleViewMapper } from '../mappers/staff-identity-core-role-view.mapper';

@Injectable()
export class StaffIdentityCoreUpdateRolePermissionsUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCoreUpdateRolePermissionsRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(StaffIdentityCoreUpdateRolePermissionsUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IStaffIdentityCoreUpdateRolePermissionsCommand,
  ): Promise<IStaffIdentityCoreRoleView> {
    const role = await this.transaction.run(() => this.replace(command));

    this.logger.info(
      { role: role.name, permissionCodes: role.permissionCodes },
      'Role permissions replaced',
    );

    return StaffIdentityCoreRoleViewMapper.toView(role);
  }

  private async replace(
    command: IStaffIdentityCoreUpdateRolePermissionsCommand,
  ): Promise<StaffIdentityCoreRoleModel> {
    const { role: name, permissionCodes } = command;
    const role = await this.repository.findRole(name);

    if (!role) {
      throw new StaffIdentityCoreException(
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
