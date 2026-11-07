import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Customer } from '@acme-core/entities';

import { AuthPersistenceCustomerBuilder } from '../builders/auth-persistence-customer.builder';

export abstract class AuthPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get customerRepository(): IHostedRepository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  protected createCustomerBuilder(): AuthPersistenceCustomerBuilder {
    return new AuthPersistenceCustomerBuilder(
      this.customerRepository.createQueryBuilder(Customer.name),
    );
  }
}
