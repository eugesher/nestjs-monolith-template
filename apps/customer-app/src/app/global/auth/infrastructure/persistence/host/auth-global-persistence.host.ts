import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Customer } from '@acme-core/entities';
import { AuthGlobalPersistenceCustomerBuilder } from '../builders/auth-global-persistence-customer.builder';

export abstract class AuthGlobalPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get customerRepository(): IHostedRepository<Customer> {
    return this.repositoryHost.getRepository(Customer);
  }

  protected createCustomerBuilder(): AuthGlobalPersistenceCustomerBuilder {
    return new AuthGlobalPersistenceCustomerBuilder(
      this.customerRepository.createQueryBuilder(Customer.name),
    );
  }
}
