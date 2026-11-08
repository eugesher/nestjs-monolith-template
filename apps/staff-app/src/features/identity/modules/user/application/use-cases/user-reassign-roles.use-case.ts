import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import {
  USER_REASSIGN_ROLES_REPOSITORY_PORT,
  type IUserReassignRolesRepositoryPort,
} from '../../outbound';
import { IUserReassignRolesCommand, IUserReassignRolesView } from '../interfaces';

@Injectable()
export class UserReassignRolesUseCase {
  constructor(
    @Inject(USER_REASSIGN_ROLES_REPOSITORY_PORT)
    private readonly repository: IUserReassignRolesRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @InjectPinoLogger(UserReassignRolesUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IUserReassignRolesCommand): Promise<IUserReassignRolesView> {
    const { userId, roleIds } = command;

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
