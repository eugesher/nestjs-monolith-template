import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  ICustomerIdentityCommonAccessTokenView,
  ICustomerIdentityCommonLoginCommand,
} from '@acme-customer-contracts/customer-identity';
import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { IdentityErrorCodeEnum } from '@acme-libs/kernel';
import { CustomerIdentityCommonCustomerModel, CustomerIdentityCommonException } from '../../domain';
import {
  CUSTOMER_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT,
  type ICustomerIdentityCommonLoginRepositoryPort,
} from '../../outbound';
import { CustomerIdentityCommonAccessTokenService } from '../services/customer-identity-common-access-token.service';

@Injectable()
export class CustomerIdentityCommonLoginUseCase {
  constructor(
    private readonly identityCoreAccessToken: CustomerIdentityCommonAccessTokenService,
    @Inject(CUSTOMER_IDENTITY_COMMON_LOGIN_REPOSITORY_PORT)
    private readonly repository: ICustomerIdentityCommonLoginRepositoryPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(CustomerIdentityCommonLoginUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: ICustomerIdentityCommonLoginCommand,
  ): Promise<ICustomerIdentityCommonAccessTokenView> {
    const { email, password } = command;
    const normalized = CustomerIdentityCommonCustomerModel.normalizeEmail(email);
    const customer = await this.repository.findByEmail(normalized);

    if (!customer) {
      this.logger.warn({ email: normalized }, 'Login failed: unknown email');

      throw new CustomerIdentityCommonException(
        IdentityErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const valid = await this.passwordHasher.verify(customer.passwordHash, password);

    if (!valid) {
      this.logger.warn({ customerId: customer.id }, 'Login failed: wrong password');

      throw new CustomerIdentityCommonException(
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
