import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  AuthRoleNotFoundException,
  AuthUserNotFoundException,
  UserStaffUserModel,
} from '../../domain';
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
    const record = await this.repository.findById(userId);

    if (!record) {
      throw new AuthUserNotFoundException(userId);
    }

    const user = UserStaffUserModel.reconstitute(record);
    const added = user.assignRole(role);

    if (added) {
      const stored = await this.repository.findRole(role);

      if (!stored) {
        throw new AuthRoleNotFoundException(role);
      }

      await this.repository.insertUserRole({ userId: user.id, roleId: stored.id });
    }

    this.logger.info({ userId, role }, 'Role assigned');

    return { id: user.id, roles: [...user.roles] };
  }
}
