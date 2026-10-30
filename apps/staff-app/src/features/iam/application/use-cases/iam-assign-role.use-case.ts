import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { IamDomainException } from '../../domain';
import { IAM_ASSIGN_ROLE_REPOSITORY_PORT, type IIamAssignRoleRepositoryPort } from '../../outbound';
import { IIamAssignRoleCommand, IIamAssignRoleView } from '../interfaces';

@Injectable()
export class IamAssignRoleUseCase {
  constructor(
    @Inject(IAM_ASSIGN_ROLE_REPOSITORY_PORT)
    private readonly repository: IIamAssignRoleRepositoryPort,
    @InjectPinoLogger(IamAssignRoleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IIamAssignRoleCommand): Promise<IIamAssignRoleView> {
    const { userId, role } = command;
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new IamDomainException(
        IdentityErrorCodeEnum.AUTH_USER_NOT_FOUND,
        `User ${userId} was not found`,
      );
    }

    const added = user.assignRole(role);
    const stored = added ? await this.repository.addRole(user.id, role) : true;

    if (!stored) {
      throw new IamDomainException(
        IdentityErrorCodeEnum.AUTH_ROLE_NOT_FOUND,
        `Role ${role} was not found`,
      );
    }

    this.logger.info({ userId, role }, 'Role assigned');

    return { id: user.id, roles: [...user.roles] };
  }
}
