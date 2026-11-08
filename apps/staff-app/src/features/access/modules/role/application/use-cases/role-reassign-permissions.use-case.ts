import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { AuthRoleNotFoundException, RoleModel } from '../../domain';
import {
  ROLE_REASSIGN_PERMISSIONS_REPOSITORY_PORT,
  type IRoleReassignPermissionsRepositoryPort,
} from '../../outbound';
import { IRoleReassignPermissionsCommand, IRoleView } from '../interfaces';

@Injectable()
export class RoleReassignPermissionsUseCase {
  constructor(
    @Inject(ROLE_REASSIGN_PERMISSIONS_REPOSITORY_PORT)
    private readonly repository: IRoleReassignPermissionsRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(RoleReassignPermissionsUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IRoleReassignPermissionsCommand): Promise<IRoleView> {
    const role = await this.transaction.run(() => this.reassign(command));

    this.logger.info(
      { role: role.name, permissionCodes: role.permissionCodes },
      'Role permissions reassigned',
    );

    return role.toSnapshot();
  }

  private async reassign(command: IRoleReassignPermissionsCommand): Promise<RoleModel> {
    const { roleId, permissionCodes } = command;
    const record = await this.repository.findRole(roleId);

    if (!record) {
      throw new AuthRoleNotFoundException(roleId);
    }

    const role = RoleModel.reconstitute(record);

    role.reassignPermissions(permissionCodes);

    const rolePermissions = role.permissionCodes.map((code) => ({ roleId: role.id, code }));

    await this.repository.deleteRolePermissions(role.id);
    await this.repository.insertRolePermissions(rolePermissions);

    return role;
  }
}
