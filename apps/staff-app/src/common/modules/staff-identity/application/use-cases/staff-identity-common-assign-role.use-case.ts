import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IStaffIdentityCommonAssignRoleCommand,
  IStaffIdentityCommonAssignRoleView,
} from '@acme-staff-contracts/staff-identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonException } from '../../domain';
import {
  STAFF_IDENTITY_COMMON_ASSIGN_ROLE_REPOSITORY_PORT,
  type IStaffIdentityCommonAssignRoleRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCommonAssignRoleUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_COMMON_ASSIGN_ROLE_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCommonAssignRoleRepositoryPort,
    @InjectPinoLogger(StaffIdentityCommonAssignRoleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IStaffIdentityCommonAssignRoleCommand,
  ): Promise<IStaffIdentityCommonAssignRoleView> {
    const { userId, role } = command;
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new StaffIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND,
        `User ${userId} was not found`,
      );
    }

    const added = user.assignRole(role);
    const stored = added ? await this.repository.addRole(user.id, role) : true;

    if (!stored) {
      throw new StaffIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND,
        `Role ${role} was not found`,
      );
    }

    this.logger.info({ userId, role }, 'Role assigned');

    return { id: user.id, roles: [...user.roles] };
  }
}
