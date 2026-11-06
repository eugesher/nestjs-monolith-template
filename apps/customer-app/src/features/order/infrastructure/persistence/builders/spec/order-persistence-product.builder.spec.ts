import { DataSource } from 'typeorm';

import { Customer, Order, OrderProduct, Product, ProductStock } from '@acme-core/entities';

import { OrderPersistenceProductBuilder } from '../order-persistence-product.builder';

describe('OrderPersistenceProductBuilder', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [Customer, Order, OrderProduct, Product, ProductStock],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  describe('forActive', () => {
    it('selects the ids of the active products among the given ones', () => {
      const builder = new OrderPersistenceProductBuilder(
        dataSource.getRepository(Product).createQueryBuilder('Product'),
      );

      builder.forActive(['100', '101']);

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id` FROM `product` `Product` ' +
          'WHERE ( `Product`.`id` IN (?, ?) AND `Product`.`status` = ? ) ' +
          'AND ( `Product`.`deletedAt` IS NULL )',
        ['100', '101', 'active'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceProductBuilder(
        dataSource.getRepository(Product).createQueryBuilder('Product'),
      );

      const chained = builder.forActive(['100']);

      expect(chained).toBe(builder);
    });
  });
});
