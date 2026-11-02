import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';

import { IUserStaffUserDraft, UserStaffUserModel } from '../../domain';
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
    const draft = UserStaffUserModel.register({ email, passwordHash, roles });
    const user = await this.transaction.run(() => this.insert(draft));

    this.logger.info({ userId: user.id }, 'User registered');

    return { id: user.id, email: user.email };
  }

  private async insert(draft: IUserStaffUserDraft): Promise<UserStaffUserModel> {
    return await this.repository.insert(draft);
  }
}
