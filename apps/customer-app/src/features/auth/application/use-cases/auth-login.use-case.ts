import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { AuthCustomerModel, AuthDomainException } from '../../domain';
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
    const normalized = AuthCustomerModel.normalizeEmail(email);
    const customer = await this.repository.findByEmail(normalized);

    if (!customer) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const valid = await this.passwordHasher.verify(customer.passwordHash, password);

    if (!valid) {
      this.logger.warn({ customerId: customer.id }, 'Login failed: wrong password');

      throw new AuthDomainException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    customer.assertActive();

    const view = await this.accessTokens.issue(customer);

    this.logger.info({ customerId: customer.id }, 'Customer logged in');

    return view;
  }
}
