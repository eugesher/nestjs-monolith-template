import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IIdentityCoreRegisterUserCommand,
  IIdentityCoreRegisterUserView,
} from '@acme-core/contracts/identity';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { IdentityCoreException, IdentityCoreUserModel } from '../../domain';
import {
  IDENTITY_CORE_PASSWORD_HASHER_PORT,
  IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT,
  type IIdentityCorePasswordHasherPort,
  type IIdentityCoreRegisterUserRepositoryPort,
} from '../../outbound';

@Injectable()
export class IdentityCoreRegisterUserUseCase {
  constructor(
    @Inject(IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT)
    private readonly repository: IIdentityCoreRegisterUserRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(IDENTITY_CORE_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IIdentityCorePasswordHasherPort,
    @InjectPinoLogger(IdentityCoreRegisterUserUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IIdentityCoreRegisterUserCommand,
  ): Promise<IIdentityCoreRegisterUserView> {
    const { email, password, roles } = command;

    IdentityCoreUserModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const user = IdentityCoreUserModel.register({ email, passwordHash, roles });

    await this.transaction.run(() => this.insert(user));

    this.logger.info({ userId: user.id }, 'User registered');

    return { id: user.id, email: user.email };
  }

  private async insert(user: IdentityCoreUserModel): Promise<void> {
    const taken = await this.repository.existsByEmail(user.email);

    if (taken) {
      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        `Email ${user.email} is already registered`,
      );
    }

    await this.repository.insert(user);
  }
}
