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
    const { userId, roleId } = command;
    const record = await this.repository.findById(userId);

    if (!record) {
      throw new AuthUserNotFoundException(userId);
    }

    const role = await this.repository.findRole(roleId);

    if (!role) {
      throw new AuthRoleNotFoundException(roleId);
    }

    const user = UserStaffUserModel.reconstitute(record);
    const added = user.assignRole(role.name);

    if (added) {
      await this.repository.insertUserRole({ userId: user.id, roleId: role.id });
    }

    this.logger.info({ userId, roleId }, 'Role assigned');

    return { id: user.id, roles: [...user.roles] };
  }
}
