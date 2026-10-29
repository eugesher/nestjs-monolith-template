import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  ICustomerIdentityCoreRegisterCommand,
  ICustomerIdentityCoreRegisterView,
} from '@acme-core/contracts/customer-identity';
import {
  CREDENTIALS_PASSWORD_HASHER_PORT,
  type ICredentialsPasswordHasherPort,
} from '@acme-libs/contracts/credentials';
import { CustomerIdentityCoreCustomerModel } from '../../domain';
import {
  CUSTOMER_IDENTITY_CORE_REGISTER_REPOSITORY_PORT,
  type ICustomerIdentityCoreRegisterRepositoryPort,
} from '../../outbound';

@Injectable()
export class CustomerIdentityCoreRegisterUseCase {
  constructor(
    @Inject(CUSTOMER_IDENTITY_CORE_REGISTER_REPOSITORY_PORT)
    private readonly repository: ICustomerIdentityCoreRegisterRepositoryPort,
    @Inject(CREDENTIALS_PASSWORD_HASHER_PORT)
    private readonly passwordHasher: ICredentialsPasswordHasherPort,
    @InjectPinoLogger(CustomerIdentityCoreRegisterUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(
    command: ICustomerIdentityCoreRegisterCommand,
  ): Promise<ICustomerIdentityCoreRegisterView> {
    const { email, password } = command;

    CustomerIdentityCoreCustomerModel.assertPasswordStrength(password);

    const passwordHash = await this.passwordHasher.hash(password);
    const customer = CustomerIdentityCoreCustomerModel.register({ email, passwordHash });

    await this.repository.insert(customer);

    this.logger.info({ customerId: customer.id }, 'Customer registered');

    return { id: customer.id, email: customer.email };
  }
}
