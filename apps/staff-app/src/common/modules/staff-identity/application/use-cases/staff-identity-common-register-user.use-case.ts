import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IStaffIdentityCommonRegisterUserCommand,
  IStaffIdentityCommonRegisterUserView,
} from '@acme-staff-contracts/staff-identity';
import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { type ITransactionPort, TRANSACTION_PORT } from '@acme-libs/contracts/database';
import { StaffIdentityCommonUserModel } from '../../domain';
import {
  STAFF_IDENTITY_COMMON_REGISTER_USER_REPOSITORY_PORT,
  type IStaffIdentityCommonRegisterUserRepositoryPort,
} from '../../outbound';

@Injectable()
export class StaffIdentityCommonRegisterUserUseCase {
  constructor(
    @Inject(STAFF_IDENTITY_COMMON_REGISTER_USER_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCommonRegisterUserRepositoryPort,
    @Inject(TRANSACTION_PORT)
    private readonly transaction: ITransactionPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(StaffIdentityCommonRegisterUserUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IStaffIdentityCommonRegisterUserCommand,
  ): Promise<IStaffIdentityCommonRegisterUserView> {
    const { email, password, roles } = command;

    StaffIdentityCommonUserModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const user = StaffIdentityCommonUserModel.register({ email, passwordHash, roles });

    await this.transaction.run(() => this.insert(user));

    this.logger.info({ userId: user.id }, 'User registered');

    return { id: user.id, email: user.email };
  }

  private async insert(user: StaffIdentityCommonUserModel): Promise<void> {
    await this.repository.insert(user);
  }
}
