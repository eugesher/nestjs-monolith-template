import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { AuthInvalidCredentialsException, AuthStaffUserModel } from '../../domain';
import {
  AUTH_CREDENTIALS_PORT,
  AUTH_LOGIN_REPOSITORY_PORT,
  type IAuthCredentialsPort,
  type IAuthLoginRepositoryPort,
} from '../../outbound';
import { IAuthLoginView, IAuthLoginCommand } from '../interfaces';

@Injectable()
export class AuthLoginUseCase {
  constructor(
    @Inject(AUTH_LOGIN_REPOSITORY_PORT)
    private readonly repository: IAuthLoginRepositoryPort,
    @Inject(AUTH_CREDENTIALS_PORT)
    private readonly credentials: IAuthCredentialsPort,
    @InjectPinoLogger(AuthLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IAuthLoginCommand): Promise<IAuthLoginView> {
    const { email, password } = command;
    const normalized = AuthStaffUserModel.normalizeEmail(email);
    const record = await this.repository.findByEmail(normalized);

    if (!record) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new AuthInvalidCredentialsException();
    }

    const user = AuthStaffUserModel.reconstitute(record);

    const { passwordHash } = user;
    const valid = await this.credentials.verifyPassword({ passwordHash, password });

    if (!valid) {
      this.logger.warn({ userId: user.id }, 'Login failed: wrong password');

      throw new AuthInvalidCredentialsException();
    }

    user.assertActive();

    const accessToken = await this.credentials.issueAccessToken(user.id);

    this.logger.info({ userId: user.id }, 'User logged in');

    return { accessToken };
  }
}
