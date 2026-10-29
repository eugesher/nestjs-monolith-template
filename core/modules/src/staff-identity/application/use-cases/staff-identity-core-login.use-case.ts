import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IStaffIdentityCoreAccessTokenView,
  IStaffIdentityCoreLoginCommand,
} from '@acme-core/contracts/staff-identity';
import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCoreException, StaffIdentityCoreUserModel } from '../../domain';
import {
  STAFF_IDENTITY_CORE_LOGIN_REPOSITORY_PORT,
  type IStaffIdentityCoreLoginRepositoryPort,
} from '../../outbound';
import { StaffIdentityCoreAccessTokenService } from '../services/staff-identity-core-access-token.service';

@Injectable()
export class StaffIdentityCoreLoginUseCase {
  constructor(
    private readonly identityCoreAccessToken: StaffIdentityCoreAccessTokenService,
    @Inject(STAFF_IDENTITY_CORE_LOGIN_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCoreLoginRepositoryPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(StaffIdentityCoreLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IStaffIdentityCoreLoginCommand,
  ): Promise<IStaffIdentityCoreAccessTokenView> {
    const { email, password } = command;
    const normalized = StaffIdentityCoreUserModel.normalizeEmail(email);
    const user = await this.repository.findByEmail(normalized);

    if (!user) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const valid = await this.passwordHasher.verify(user.passwordHash, password);

    if (!valid) {
      this.logger.warn({ userId: user.id }, 'Login failed: wrong password');

      throw new StaffIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    user.assertActive();

    const view = await this.identityCoreAccessToken.issue(user);

    this.logger.info({ userId: user.id }, 'User logged in');

    return view;
  }
}
