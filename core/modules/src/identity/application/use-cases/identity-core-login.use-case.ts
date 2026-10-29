import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  IIdentityCoreAccessTokenView,
  IIdentityCoreLoginCommand,
} from '@acme-core/contracts/identity';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { IdentityCoreException, IdentityCoreUserModel } from '../../domain';
import {
  IDENTITY_CORE_LOGIN_REPOSITORY_PORT,
  IDENTITY_CORE_PASSWORD_HASHER_PORT,
  type IIdentityCoreLoginRepositoryPort,
  type IIdentityCorePasswordHasherPort,
} from '../../outbound';
import { IdentityCoreAccessTokenService } from '../services/identity-core-access-token.service';

@Injectable()
export class IdentityCoreLoginUseCase {
  constructor(
    private readonly identityCoreAccessToken: IdentityCoreAccessTokenService,
    @Inject(IDENTITY_CORE_LOGIN_REPOSITORY_PORT)
    private readonly repository: IIdentityCoreLoginRepositoryPort,
    @Inject(IDENTITY_CORE_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IIdentityCorePasswordHasherPort,
    @InjectPinoLogger(IdentityCoreLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IIdentityCoreLoginCommand): Promise<IIdentityCoreAccessTokenView> {
    const { email, password } = command;
    const normalized = IdentityCoreUserModel.normalizeEmail(email);
    const user = await this.repository.findByEmail(normalized);

    if (!user) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const valid = await this.passwordHasher.verify(user.passwordHash, password);

    if (!valid) {
      this.logger.warn({ userId: user.id }, 'Login failed: wrong password');

      throw new IdentityCoreException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    user.assertActive();

    const permissionCodes = await this.repository.findPermissionCodes(user.id);
    const view = await this.identityCoreAccessToken.issue(user, permissionCodes);

    this.logger.info({ userId: user.id }, 'User logged in');

    return view;
  }
}
