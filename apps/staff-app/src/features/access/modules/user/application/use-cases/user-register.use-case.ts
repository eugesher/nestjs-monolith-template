import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import {
  AuthEmailTakenException,
  AuthRoleNotFoundException,
  UserStaffUserModel,
  type IUserStaffUserDraftOutput,
} from '../../domain';
import {
  USER_CREDENTIALS_PORT,
  USER_REGISTER_REPOSITORY_PORT,
  USER_TRANSACTION_PORT,
  UserRegisterStaffUserInsertOutcomeEnum,
  type IUserCredentialsPort,
  type IUserRegisterRepositoryPort,
  type IUserTransactionPort,
} from '../../outbound';
import type { IUserRegisterCommand, IUserRegisterView } from '../interfaces';

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
    const userDraft = UserStaffUserModel.createDraft({ email, passwordHash, roleIds });
    const userId = await this.transaction.run(() => this.insert(userDraft));

    this.logger.info({ userId }, 'User registered');

    return { id: userId, email: userDraft.email };
  }

  private async insert(draft: IUserStaffUserDraftOutput): Promise<string> {
    const { email, passwordHash, status, roleIds } = draft;

    const insertResult = await this.repository.insertUser({ email, passwordHash, status });

    if (insertResult.outcome === UserRegisterStaffUserInsertOutcomeEnum.DUPLICATE) {
      throw new AuthEmailTakenException();
    }

    const { id } = insertResult;
    const storedRoles = await this.repository.findRoles(roleIds);
    const missingRoleId = roleIds.find(
      (roleId) => !storedRoles.some((stored) => stored.id === roleId),
    );

    if (missingRoleId !== undefined) {
      throw new AuthRoleNotFoundException(missingRoleId);
    }

    const userRoles = storedRoles.map((role) => ({ userId: id, roleId: role.id }));

    await this.repository.insertUserRoles(userRoles);

    return id;
  }
}
