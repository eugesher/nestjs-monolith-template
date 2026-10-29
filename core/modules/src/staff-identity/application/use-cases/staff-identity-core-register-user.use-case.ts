import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IStaffIdentityCoreRegisterUserCommand,
  IStaffIdentityCoreRegisterUserView,
} from '@acme-core/contracts/staff-identity';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreException, StaffIdentityCoreUserModel } from '../../domain';
import {
  STAFF_IDENTITY_CORE_PASSWORD_HASHER_PORT,
  STAFF_IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT,
  type IStaffIdentityCorePasswordHasherPort,
  type IStaffIdentityCoreRegisterUserRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCoreRegisterUserUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_CORE_REGISTER_USER_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCoreRegisterUserRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(STAFF_IDENTITY_CORE_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IStaffIdentityCorePasswordHasherPort,
    @InjectPinoLogger(StaffIdentityCoreRegisterUserUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IStaffIdentityCoreRegisterUserCommand,
  ): Promise<IStaffIdentityCoreRegisterUserView> {
    const { email, password, roles } = command;

    StaffIdentityCoreUserModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const user = StaffIdentityCoreUserModel.register({ email, passwordHash, roles });

    await this.transaction.run(() => this.insert(user));

    this.logger.info({ userId: user.id }, 'User registered');

    return { id: user.id, email: user.email };
  }

  private async insert(user: StaffIdentityCoreUserModel): Promise<void> {
    const taken = await this.repository.existsByEmail(user.email);

    if (taken) {
      throw new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_EMAIL_TAKEN,
        `Email ${user.email} is already registered`,
      );
    }

    await this.repository.insert(user);
  }
}
