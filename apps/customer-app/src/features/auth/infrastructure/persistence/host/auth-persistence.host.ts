import { Customer } from '@acme-core/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { AuthPersistenceCustomerBuilder } from '../builders/auth-persistence-customer.builder';

export abstract class AuthPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get customerRepository(): IHostedRepository<Customer> {
    return this.orm.getRepository(Customer);
  }

  protected createCustomerBuilder(): AuthPersistenceCustomerBuilder {
    return new AuthPersistenceCustomerBuilder(
      this.customerRepository.createQueryBuilder(Customer.name),
    );
  }
}
