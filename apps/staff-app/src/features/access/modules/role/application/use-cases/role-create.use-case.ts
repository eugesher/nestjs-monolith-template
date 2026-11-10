import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { AuthRoleNameTakenException, IRoleDraftOutput, RoleModel } from '../../domain';
import {
  ROLE_CREATE_REPOSITORY_PORT,
  ROLE_TRANSACTION_PORT,
  type IRoleCreateRepositoryPort,
  type IRoleTransactionPort,
} from '../../outbound';
import { IRoleCreateCommand, IRoleView } from '../interfaces';

@Injectable()
export class RoleCreateUseCase {
  constructor(
    @Inject(ROLE_CREATE_REPOSITORY_PORT)
    private readonly repository: IRoleCreateRepositoryPort,
    @Inject(ROLE_TRANSACTION_PORT)
    private readonly transaction: IRoleTransactionPort,
    @InjectPinoLogger(RoleCreateUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IRoleCreateCommand): Promise<IRoleView> {
    const { name, permissionCodes } = command;
    const draft = RoleModel.createDraft({ name, permissionCodes });
    const id = await this.transaction.run(() => this.insert(draft));

    this.logger.info({ roleId: id }, 'Role created');

    return { id, name: draft.name, permissionCodes: draft.permissionCodes };
  }

  private async insert(draft: IRoleDraftOutput): Promise<string> {
    const { name, permissionCodes } = draft;

    try {
      const id = await this.repository.insertRole({ name });
      const rolePermissions = permissionCodes.map((code) => ({ roleId: id, code }));

      await this.repository.insertRolePermissions(rolePermissions);

      return id;
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new AuthRoleNameTakenException(name);
      }

      throw error;
    }
  }
}
