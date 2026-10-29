import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IStaffIdentityCoreAssignRoleCommand,
  IStaffIdentityCoreAssignRoleView,
} from '@acme-core/contracts/staff-identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreException } from '../../domain';
import {
  STAFF_IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT,
  type IStaffIdentityCoreAssignRoleRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCoreAssignRoleUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_ASSIGN_ROLE_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCoreAssignRoleRepositoryPort,
    @InjectPinoLogger(StaffIdentityCoreAssignRoleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IStaffIdentityCoreAssignRoleCommand,
  ): Promise<IStaffIdentityCoreAssignRoleView> {
    const { userId, role } = command;
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND,
        `User ${userId} was not found`,
      );
    }

    const added = user.assignRole(role);
    const stored = added ? await this.repository.addRole(user.id, role) : true;

    if (!stored) {
      throw new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND,
        `Role ${role} was not found`,
      );
    }

    this.logger.info({ userId, role }, 'Role assigned');

    return { id: user.id, roles: [...user.roles] };
  }
}
