import { DataSource, SelectQueryBuilder } from 'typeorm';

import { Customer } from '@acme-core/entities';

import { AuthGlobalPersistenceCustomerBuilder } from '../auth-global-persistence-customer.builder';

describe('AuthGlobalPersistenceCustomerBuilder', () => {
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

  describe('forActiveById', () => {
    it('selects the id and email of the active customer', () => {
      const builder = new AuthGlobalPersistenceCustomerBuilder(baseBuilder);

      builder.forActiveById('1');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Customer`.`id` AS `Customer_id`, `Customer`.`email` AS `Customer_email` ' +
          'FROM `customer` `Customer` ' +
          'WHERE `Customer`.`id` = ? AND `Customer`.`status` = ?',
        ['1', 'active'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new AuthGlobalPersistenceCustomerBuilder(baseBuilder);
      const chained = builder.forActiveById('1');

      expect(chained).toBe(builder);
    });
  });
});
