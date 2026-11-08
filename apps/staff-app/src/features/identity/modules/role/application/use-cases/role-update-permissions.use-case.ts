import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { AuthRoleNotFoundException, RoleModel } from '../../domain';
import {
  ROLE_UPDATE_PERMISSIONS_REPOSITORY_PORT,
  type IRoleUpdatePermissionsRepositoryPort,
} from '../../outbound';
import { IRoleUpdatePermissionsCommand, IRoleView } from '../interfaces';

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

    return role.toSnapshot();
  }

  private async replace(command: IRoleUpdatePermissionsCommand): Promise<RoleModel> {
    const { roleId, permissionCodes } = command;
    const record = await this.repository.findRole(roleId);

    if (!record) {
      throw new AuthRoleNotFoundException(roleId);
    }

    const role = RoleModel.reconstitute(record);

    role.replacePermissions(permissionCodes);

    const rolePermissions = role.permissionCodes.map((code) => ({ roleId: role.id, code }));

    await this.repository.deleteRolePermissions(role.id);
    await this.repository.insertRolePermissions(rolePermissions);

    return role;
  }
}
