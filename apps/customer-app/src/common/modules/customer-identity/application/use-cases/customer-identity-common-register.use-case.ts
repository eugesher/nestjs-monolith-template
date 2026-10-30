import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  ICustomerIdentityCommonRegisterCommand,
  ICustomerIdentityCommonRegisterView,
} from '@acme-customer-contracts/customer-identity';
import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { CustomerIdentityCommonCustomerModel } from '../../domain';
import {
  CUSTOMER_IDENTITY_COMMON_REGISTER_REPOSITORY_PORT,
  type ICustomerIdentityCommonRegisterRepositoryPort,
} from '../../outbound';

@Injectable()
export class CustomerIdentityCommonRegisterUseCase {
  constructor(
    @Inject(CUSTOMER_IDENTITY_COMMON_REGISTER_REPOSITORY_PORT)
    private readonly repository: ICustomerIdentityCommonRegisterRepositoryPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(CustomerIdentityCommonRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: ICustomerIdentityCommonRegisterCommand,
  ): Promise<ICustomerIdentityCommonRegisterView> {
    const { email, password } = command;

    CustomerIdentityCommonCustomerModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const customer = CustomerIdentityCommonCustomerModel.register({ email, passwordHash });

    await this.repository.insert(customer);

    this.logger.info({ customerId: customer.id }, 'Customer registered');

    return { id: customer.id, email: customer.email };
  }
}
