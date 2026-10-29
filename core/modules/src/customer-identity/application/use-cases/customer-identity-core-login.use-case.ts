import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  ICustomerIdentityCoreAccessTokenView,
  ICustomerIdentityCoreLoginCommand,
} from '@acme-core/contracts/customer-identity';
import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { CustomerIdentityCoreCustomerModel, CustomerIdentityCoreException } from '../../domain';
import {
  CUSTOMER_IDENTITY_CORE_LOGIN_REPOSITORY_PORT,
  type ICustomerIdentityCoreLoginRepositoryPort,
} from '../../outbound';
import { CustomerIdentityCoreAccessTokenService } from '../services/customer-identity-core-access-token.service';

@Injectable()
export class CustomerIdentityCoreLoginUseCase {
  constructor(
    private readonly identityCoreAccessToken: CustomerIdentityCoreAccessTokenService,
    @Inject(CUSTOMER_IDENTITY_CORE_LOGIN_REPOSITORY_PORT)
    private readonly repository: ICustomerIdentityCoreLoginRepositoryPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(CustomerIdentityCoreLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: ICustomerIdentityCoreLoginCommand,
  ): Promise<ICustomerIdentityCoreAccessTokenView> {
    const { email, password } = command;
    const normalized = CustomerIdentityCoreCustomerModel.normalizeEmail(email);
    const customer = await this.repository.findByEmail(normalized);

    if (!customer) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new CustomerIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const valid = await this.passwordHasher.verify(customer.passwordHash, password);

    if (!valid) {
      this.logger.warn({ customerId: customer.id }, 'Login failed: wrong password');

      throw new CustomerIdentityCoreException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    customer.assertActive();

    const view = await this.identityCoreAccessToken.issue(customer);

    this.logger.info({ customerId: customer.id }, 'Customer logged in');

    return view;
  }
}
