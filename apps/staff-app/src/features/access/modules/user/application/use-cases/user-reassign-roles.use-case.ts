import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { AuthRoleNotFoundException, AuthUserNotFoundException } from '../../domain';
import {
  USER_REASSIGN_ROLES_REPOSITORY_PORT,
  USER_TRANSACTION_PORT,
  type IUserReassignRolesRepositoryPort,
  type IUserTransactionPort,
} from '../../outbound';
import type { IUserReassignRolesCommand, IUserReassignRolesView } from '../interfaces';

@Injectable()
export class UserReassignRolesUseCase {
  constructor(
    @Inject(USER_REASSIGN_ROLES_REPOSITORY_PORT)
    private readonly repository: IUserReassignRolesRepositoryPort,
    @Inject(USER_TRANSACTION_PORT)
    private readonly transaction: IUserTransactionPort,
    @InjectPinoLogger(UserReassignRolesUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IUserReassignRolesCommand): Promise<IUserReassignRolesView> {
    const { userId, roleIds } = command;
    const exists = await this.repository.existsUser(userId);

    if (!exists) {
      throw new AuthUserNotFoundException(userId);
    }

    const storedRoles = await this.repository.findRoles(roleIds);
    const missing = roleIds.find((roleId) => !storedRoles.some((stored) => stored.id === roleId));

    if (missing !== undefined) {
      throw new AuthRoleNotFoundException(missing);
    }

    await this.transaction.run(() => this.reassign(command));

    this.logger.info({ userId, roleIds }, 'Roles reassigned');

    return { id: userId, roleIds };
  }

  private async reassign(command: IUserReassignRolesCommand): Promise<void> {
    const { userId, roleIds } = command;
    const userRoles = roleIds.map((roleId) => ({ userId, roleId }));

    await this.repository.deleteUserRolesExcept(userId, roleIds);
    await this.repository.insertUserRolesIgnore(userRoles);
  }
}
