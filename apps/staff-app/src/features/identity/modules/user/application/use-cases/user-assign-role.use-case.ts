import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { UserDomainException } from '../../domain';
import {
  USER_ASSIGN_ROLE_REPOSITORY_PORT,
  type IUserAssignRoleRepositoryPort,
} from '../../outbound';
import { IUserAssignRoleCommand, IUserAssignRoleView } from '../interfaces';

@Injectable()
export class UserAssignRoleUseCase {
  constructor(
    @Inject(USER_ASSIGN_ROLE_REPOSITORY_PORT)
    private readonly repository: IUserAssignRoleRepositoryPort,
    @InjectPinoLogger(UserAssignRoleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IUserAssignRoleCommand): Promise<IUserAssignRoleView> {
    const { userId, role } = command;
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new UserDomainException(
        IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND,
        `User ${userId} was not found`,
      );
    }

    const added = user.assignRole(role);
    const stored = added ? await this.repository.addRole(user.id, role) : true;

    if (!stored) {
      throw new UserDomainException(
        IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND,
        `Role ${role} was not found`,
      );
    }

    this.logger.info({ userId, role }, 'Role assigned');

    return { id: user.id, roles: [...user.roles] };
  }
}
