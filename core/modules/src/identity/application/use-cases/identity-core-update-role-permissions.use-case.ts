import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IIdentityCoreRoleView,
  IIdentityCoreUpdateRolePermissionsCommand,
} from '@acme-core/contracts/identity';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { IdentityCoreException, IdentityCoreRoleModel } from '../../domain';
import {
  IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
  type IIdentityCoreUpdateRolePermissionsRepositoryPort,
} from '../../outbound';
import { IdentityCoreRoleViewMapper } from '../mappers/identity-core-role-view.mapper';

@Injectable()
export class IdentityCoreUpdateRolePermissionsUseCase {
  constructor(
    @Inject(IDENTITY_CORE_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT)
    private readonly repository: IIdentityCoreUpdateRolePermissionsRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(IdentityCoreUpdateRolePermissionsUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IIdentityCoreUpdateRolePermissionsCommand,
  ): Promise<IIdentityCoreRoleView> {
    const role = await this.transaction.run(() => this.replace(command));

    this.logger.info(
      { role: role.name, permissionCodes: role.permissionCodes },
      'Role permissions replaced',
    );

    return IdentityCoreRoleViewMapper.toView(role);
  }

  private async replace(
    command: IIdentityCoreUpdateRolePermissionsCommand,
  ): Promise<IdentityCoreRoleModel> {
    const { role: name, permissionCodes } = command;
    const role = await this.repository.findRole(name);

    if (!role) {
      throw new IdentityCoreException(
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
