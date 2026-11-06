import { DataSource, SelectQueryBuilder } from 'typeorm';

import { Product } from '@acme-core/entities';

import { OrderPersistenceProductBuilder } from '../order-persistence-product.builder';

describe('OrderPersistenceProductBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<Product>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [Product],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(Product).createQueryBuilder(Product.name);
  });

  describe('forActive', () => {
    it('selects the ids of the active products among the given ones', () => {
      const builder = new OrderPersistenceProductBuilder(baseBuilder);

      builder.forActive(['100', '101']);

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id` FROM `product` `Product` ' +
          'WHERE ( `Product`.`id` IN (?, ?) AND `Product`.`status` = ? ) ' +
          'AND ( `Product`.`deletedAt` IS NULL )',
        ['100', '101', 'active'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceProductBuilder(baseBuilder);
      const chained = builder.forActive(['100']);

      expect(chained).toBe(builder);
    });
  });
});
