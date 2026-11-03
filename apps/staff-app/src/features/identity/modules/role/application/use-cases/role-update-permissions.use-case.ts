import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';

import { AuthRoleNotFoundException, RoleModel, RolePermissionModel } from '../../domain';
import {
  ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT,
  type IRoleUpdatePermissionsRepositoryPort,
} from '../../outbound';
import { IRoleView, IRoleUpdatePermissionsCommand } from '../interfaces';

@Injectable()
export class RoleUpdatePermissionsUseCase {
  constructor(
    @Inject(ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT)
    private readonly repository: IRoleUpdatePermissionsRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(RoleUpdatePermissionsUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IRoleUpdatePermissionsCommand): Promise<IRoleView> {
    const role = await this.transaction.run(() => this.replace(command));

    this.logger.info(
      { role: role.name, permissionCodes: role.permissionCodes },
      'Role permissions replaced',
    );

    return role.toView();
  }

  private async replace(command: IRoleUpdatePermissionsCommand): Promise<RoleModel> {
    const { role: name, permissionCodes } = command;
    const record = await this.repository.findRole(name);

    if (!record) {
      throw new AuthRoleNotFoundException(name);
    }

    const role = RoleModel.reconstitute(record);
    const permissionRecords = await this.repository.findPermissions(permissionCodes);
    const known = permissionRecords.map((permission) =>
      RolePermissionModel.reconstitute(permission),
    );

    role.replacePermissions(permissionCodes, known);

    const rolePermissions = known.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
    }));

    await this.repository.deleteRolePermissions(role.id);
    await this.repository.insertRolePermissions(rolePermissions);

    return role;
  }
}
