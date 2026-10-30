import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { IamStaffUserModel } from '../../domain';
import {
  IAM_REGISTER_USER_REPOSITORY_PORT,
  type IIamRegisterUserRepositoryPort,
} from '../../outbound';
import { IIamRegisterUserCommand, IIamRegisterUserView } from '../interfaces';

@Injectable()
export class IamRegisterUserUseCase {
  constructor(
    @Inject(IAM_REGISTER_USER_REPOSITORY_PORT)
    private readonly repository: IIamRegisterUserRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(IamRegisterUserUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IIamRegisterUserCommand): Promise<IIamRegisterUserView> {
    const { email, password, roles } = command;

    IamStaffUserModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const user = IamStaffUserModel.register({ email, passwordHash, roles });

    await this.transaction.run(() => this.insert(user));

    this.logger.info({ userId: user.id }, 'User registered');

    return { id: user.id, email: user.email };
  }

  private async insert(user: IamStaffUserModel): Promise<void> {
    await this.repository.insert(user);
  }
}
