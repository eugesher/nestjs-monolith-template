import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { AuthCustomerModel, AuthInvalidCredentialsException } from '../../domain';
import {
  AUTH_CREDENTIALS_PORT,
  AUTH_LOGIN_REPOSITORY_PORT,
  type IAuthCredentialsPort,
  type IAuthLoginRepositoryPort,
} from '../../outbound';
import type { IAuthLoginCommand, IAuthLoginView } from '../interfaces';

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
    const normalized = AuthCustomerModel.normalizeEmail(email);
    const record = await this.repository.findByEmail(normalized);
    const customer = record ? AuthCustomerModel.reconstitute(record) : null;
    const passwordHash = customer?.passwordHash ?? null;
    const valid = await this.credentials.verifyPassword({ passwordHash, password });

    if (!customer) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new AuthInvalidCredentialsException();
    }

    if (!valid) {
      this.logger.warn({ customerId: customer.id }, 'Login failed: wrong password');

      throw new AuthInvalidCredentialsException();
    }

    customer.assertActive();

    const accessToken = await this.credentials.issueAccessToken(customer.id);

    this.logger.info({ customerId: customer.id }, 'Customer logged in');

    return { accessToken };
  }
}
