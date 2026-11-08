import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { MysqlErrorHelper } from '@acme-libs/toolkit';
import { TRANSACTION_PORT, type ITransactionPort } from '@acme-libs/contracts/local-storage';

import { AuthEmailTakenException, IUserStaffUserDraft, UserStaffUserModel } from '../../domain';
import {
  USER_CREDENTIALS_PORT,
  USER_REGISTER_REPOSITORY_PORT,
  type IUserCredentialsPort,
  type IUserRegisterRepositoryPort,
} from '../../outbound';
import { IUserRegisterCommand, IUserRegisterView } from '../interfaces';

@Injectable()
export class UserRegisterUseCase {
  constructor(
    @Inject(USER_REGISTER_REPOSITORY_PORT)
    private readonly repository: IUserRegisterRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(USER_CREDENTIALS_PORT)
    private readonly credentials: IUserCredentialsPort,
    @InjectPinoLogger(UserRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IUserRegisterCommand): Promise<IUserRegisterView> {
    const { email, password, roles } = command;

    UserStaffUserModel.assertPasswordStrength(password);

    const passwordHash = await this.credentials.hashPassword(password);
    const draft = UserStaffUserModel.createDraft({ email, passwordHash, roles });
    const id = await this.transaction.run(() => this.insert(draft));

    this.logger.info({ userId: id }, 'User registered');

    return { id, email: draft.email };
  }

  private async insert(draft: IUserStaffUserDraft): Promise<string> {
    const { email, passwordHash, status, roles } = draft;

    try {
      const id = await this.repository.insertUser({ email, passwordHash, status });
      const storedRoles = await this.repository.findRoles(roles);
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
