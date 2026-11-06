import { DataSource, SelectQueryBuilder } from 'typeorm';

import { Customer } from '@acme-core/entities';

import { AuthPersistenceCustomerBuilder } from '../auth-persistence-customer.builder';

describe('AuthPersistenceCustomerBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<Customer>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [Customer],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(Customer).createQueryBuilder(Customer.name);
  });

  describe('forByEmail', () => {
    it('selects the credentials and status of the customer with the email', () => {
      const builder = new AuthPersistenceCustomerBuilder(baseBuilder);

      builder.forByEmail('ann@example.com');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Customer`.`id` AS `Customer_id`, `Customer`.`passwordHash` AS `Customer_passwordHash`, `Customer`.`status` AS `Customer_status` ' +
          'FROM `customer` `Customer` ' +
          'WHERE `Customer`.`email` = ?',
        ['ann@example.com'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new AuthPersistenceCustomerBuilder(baseBuilder);
      const chained = builder.forByEmail('ann@example.com');

      expect(chained).toBe(builder);
    });
  });
});
