import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { UserStaffUserModel } from '../../domain';
import { USER_REGISTER_REPOSITORY_PORT, type IUserRegisterRepositoryPort } from '../../outbound';
import { IUserRegisterCommand, IUserRegisterView } from '../interfaces';

@Injectable()
export class UserRegisterUseCase {
  constructor(
    @Inject(USER_REGISTER_REPOSITORY_PORT)
    private readonly repository: IUserRegisterRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(UserRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IUserRegisterCommand): Promise<IUserRegisterView> {
    const { email, password, roles } = command;

    UserStaffUserModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const user = UserStaffUserModel.register({ email, passwordHash, roles });

    await this.transaction.run(() => this.insert(user));

    this.logger.info({ userId: user.id }, 'User registered');

    return { id: user.id, email: user.email };
  }

  private async insert(user: UserStaffUserModel): Promise<void> {
    await this.repository.insert(user);
  }
}
