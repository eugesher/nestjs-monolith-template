import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';

import {
  AuthEmailTakenException,
  AuthRoleNotFoundException,
  IUserStaffUserDraftOutput,
  UserStaffUserModel,
} from '../../domain';
import {
  USER_CREDENTIALS_PORT,
  USER_REGISTER_REPOSITORY_PORT,
  USER_TRANSACTION_PORT,
  type IUserCredentialsPort,
  type IUserRegisterRepositoryPort,
  type IUserTransactionPort,
} from '../../outbound';
import { IUserRegisterCommand, IUserRegisterView } from '../interfaces';

@Injectable()
export class UserRegisterUseCase {
  constructor(
    @Inject(USER_REGISTER_REPOSITORY_PORT)
    private readonly repository: IUserRegisterRepositoryPort,
    @Inject(USER_TRANSACTION_PORT)
    private readonly transaction: IUserTransactionPort,
    @Inject(USER_CREDENTIALS_PORT)
    private readonly credentials: IUserCredentialsPort,
    @InjectPinoLogger(UserRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IUserRegisterCommand): Promise<IUserRegisterView> {
    const { email, password, roleIds } = command;

    UserStaffUserModel.assertPasswordStrength(password);

    const passwordHash = await this.credentials.hashPassword(password);
    const draft = UserStaffUserModel.createDraft({ email, passwordHash, roleIds });
    const id = await this.transaction.run(() => this.insert(draft));

    this.logger.info({ userId: id }, 'User registered');

    return { id, email: draft.email };
  }

  private async insert(draft: IUserStaffUserDraftOutput): Promise<string> {
    const { email, passwordHash, status, roleIds } = draft;

    try {
      const id = await this.repository.insertUser({ email, passwordHash, status });
      const storedRoles = await this.repository.findRoles(roleIds);
      const missing = roleIds.find((roleId) => !storedRoles.some((stored) => stored.id === roleId));

      if (missing !== undefined) {
        throw new AuthRoleNotFoundException(missing);
      }

      const userRoles = storedRoles.map((role) => ({ userId: id, roleId: role.id }));

      await this.repository.insertUserRoles(userRoles);

      return id;
    } catch (error) {
      if (MysqlErrorHelper.isDuplicateKey(error)) {
        throw new AuthEmailTakenException(email);
      }

      throw error;
    }
  }
}
