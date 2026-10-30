import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { IamDomainException, IamRoleModel } from '../../domain';
import {
  IAM_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT,
  type IIamUpdateRolePermissionsRepositoryPort,
} from '../../outbound';
import { IIamRoleView, IIamUpdateRolePermissionsCommand } from '../interfaces';
import { IamRoleViewMapper } from '../mappers/iam-role-view.mapper';

@Injectable()
export class IamUpdateRolePermissionsUseCase {
  constructor(
    @Inject(IAM_UPDATE_ROLE_PERMISSIONS_REPOSITORY_PORT)
    private readonly repository: IIamUpdateRolePermissionsRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(IamUpdateRolePermissionsUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IIamUpdateRolePermissionsCommand): Promise<IIamRoleView> {
    const role = await this.transaction.run(() => this.replace(command));

    this.logger.info(
      { role: role.name, permissionCodes: role.permissionCodes },
      'Role permissions replaced',
    );

    return IamRoleViewMapper.toView(role);
  }

  private async replace(command: IIamUpdateRolePermissionsCommand): Promise<IamRoleModel> {
    const { role: name, permissionCodes } = command;
    const role = await this.repository.findRole(name);

    if (!role) {
      throw new IamDomainException(
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
