import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IIdentityCoreAssignRoleCommand,
  IIdentityCoreAssignRoleView,
} from '@acme-core/contracts/identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { IdentityCoreException } from '../../domain';
import {
  IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT,
  type IIdentityCoreAssignRoleRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdentityCoreAssignRoleUseCase {
  constructor(
    @Inject(IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT)
    private readonly repository: IIdentityCoreAssignRoleRepositoryPort,
    @InjectPinoLogger(IdentityCoreAssignRoleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IIdentityCoreAssignRoleCommand,
  ): Promise<IIdentityCoreAssignRoleView> {
    const { userId, role } = command;
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND,
        `User ${userId} was not found`,
      );
    }

    const added = user.assignRole(role);
    const stored = added ? await this.repository.addRole(user.id, role) : true;

    if (!stored) {
      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND,
        `Role ${role} was not found`,
      );
    }

    this.logger.info({ userId, role }, 'Role assigned');

    return { id: user.id, roles: [...user.roles] };
  }
}
