import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { AuthInvalidCredentialsException, AuthStaffUserModel } from '../../domain';
import {
  AUTH_ACCESS_TOKEN_PORT,
  AUTH_LOGIN_REPOSITORY_PORT,
  AUTH_PASSWORD_HASHER_PORT,
  type IAuthAccessTokenPort,
  type IAuthLoginRepositoryPort,
  type IAuthPasswordHasherPort,
} from '../../outbound';
import { IAuthAccessTokenView, IAuthLoginCommand } from '../interfaces';

@Injectable()
export class AuthLoginUseCase {
  constructor(
    @Inject(AUTH_LOGIN_REPOSITORY_PORT)
    private readonly repository: IAuthLoginRepositoryPort,
    @Inject(AUTH_ACCESS_TOKEN_PORT)
    private readonly accessToken: IAuthAccessTokenPort,
    @Inject(AUTH_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: IAuthPasswordHasherPort,
    @InjectPinoLogger(AuthLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IAuthLoginCommand): Promise<IAuthAccessTokenView> {
    const { email, password } = command;
    const normalized = AuthStaffUserModel.normalizeEmail(email);
    const user = await this.repository.findByEmail(normalized);

    if (!user) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new AuthInvalidCredentialsException();
    }

    const { passwordHash } = user;
    const valid = await this.passwordHasher.verify({ passwordHash, password });

    if (!valid) {
      this.logger.warn({ userId: user.id }, 'Login failed: wrong password');

      throw new AuthInvalidCredentialsException();
    }

    user.assertActive();

    const accessToken = await this.accessToken.issue(user.id);

    this.logger.info({ userId: user.id }, 'User logged in');

    return { accessToken };
  }
}
