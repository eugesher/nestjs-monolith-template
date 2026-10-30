import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { AuthDomainException, AuthStaffUserModel } from '../../domain';
import { AUTH_LOGIN_REPOSITORY_PORT, type IAuthLoginRepositoryPort } from '../../outbound';
import { IAuthAccessTokenView, IAuthLoginCommand } from '../interfaces';
import { AuthAccessTokenService } from '../services/auth-access-token.service';

@Injectable()
export class AuthLoginUseCase {
  constructor(
    private readonly accessTokens: AuthAccessTokenService,
    @Inject(AUTH_LOGIN_REPOSITORY_PORT)
    private readonly repository: IAuthLoginRepositoryPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(AuthLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IAuthLoginCommand): Promise<IAuthAccessTokenView> {
    const { email, password } = command;
    const normalized = AuthStaffUserModel.normalizeEmail(email);
    const user = await this.repository.findByEmail(normalized);

    if (!user) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const valid = await this.passwordHasher.verify(user.passwordHash, password);

    if (!valid) {
      this.logger.warn({ userId: user.id }, 'Login failed: wrong password');

      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    user.assertActive();

    const view = await this.accessTokens.issue(user);

    this.logger.info({ userId: user.id }, 'User logged in');

    return view;
  }
}
