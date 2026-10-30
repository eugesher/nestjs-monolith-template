import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IStaffIdentityCommonAccessTokenView,
  IStaffIdentityCommonLoginCommand,
} from '@acme-staff-contracts/staff-identity';
import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { StaffIdentityCommonException, StaffIdentityCommonUserModel } from '../../domain';
import {
  STAFF_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT,
  type IStaffIdentityCommonLoginRepositoryPort,
} from '../../outbound';
import { StaffIdentityCommonAccessTokenService } from '../services/staff-identity-common-access-token.service';

@Injectable()
export class StaffIdentityCommonLoginUseCase {
  constructor(
    private readonly identityCoreAccessToken: StaffIdentityCommonAccessTokenService,
    @Inject(STAFF_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT)
    private readonly repository: IStaffIdentityCommonLoginRepositoryPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(StaffIdentityCommonLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: IStaffIdentityCommonLoginCommand,
  ): Promise<IStaffIdentityCommonAccessTokenView> {
    const { email, password } = command;
    const normalized = StaffIdentityCommonUserModel.normalizeEmail(email);
    const user = await this.repository.findByEmail(normalized);

    if (!user) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new StaffIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const valid = await this.passwordHasher.verify(user.passwordHash, password);

    if (!valid) {
      this.logger.warn({ userId: user.id }, 'Login failed: wrong password');

      throw new StaffIdentityCommonException(
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
