import { DataSource, type SelectQueryBuilder } from 'typeorm';

import { Product } from '@acme-core/entities';

import { ProductStockCorePersistenceProductBuilder } from '../product-stock-core-persistence-product.builder';

describe('ProductStockCorePersistenceProductBuilder', () => {
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

  describe('forLockProducts', () => {
    it('selects the given products in id order under an exclusive lock', () => {
      const builder = new ProductStockCorePersistenceProductBuilder(baseBuilder);

      builder.forLockProducts(['100', '101']);

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id` ' +
          'FROM `product` `Product` ' +
          'WHERE ( `Product`.`id` IN (?, ?) ) AND ( `Product`.`deletedAt` IS NULL ) ' +
          'ORDER BY `Product_id` ASC ' +
          'FOR UPDATE',
        ['100', '101'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ProductStockCorePersistenceProductBuilder(baseBuilder);
      const chained = builder.forLockProducts(['100', '101']);

      expect(chained).toBe(builder);
    });
  });
});
