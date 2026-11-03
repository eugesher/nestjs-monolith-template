import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { MysqlErrorHelper } from '@acme-libs/toolkit';

import { AuthEmailTakenException, IUserStaffUserDraft, UserStaffUserModel } from '../../domain';
import {
  type IUserPasswordHasherPort,
  type IUserRegisterRepositoryPort,
  USER_PASSWORD_HASHER_PORT,
  USER_REGISTER_REPOSITORY_PORT,
} from '../../outbound';
import { IUserRegisterCommand, IUserRegisterView } from '../interfaces';

@Injectable()
export class UserRegisterUseCase {
  constructor(
    @Inject(USER_REGISTER_REPOSITORY_PORT)
    private readonly repository: IUserRegisterRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(USER_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IUserPasswordHasherPort,
    @InjectPinoLogger(UserRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IUserRegisterCommand): Promise<IUserRegisterView> {
    const { email, password, roles } = command;

    UserStaffUserModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
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
