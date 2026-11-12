import { DataSource, type SelectQueryBuilder } from 'typeorm';

import { Product } from '@acme-core/entities';

import { ProductStockPersistenceProductBuilder } from '../product-stock-persistence-product.builder';

describe('ProductStockPersistenceProductBuilder', () => {
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

  describe('forById', () => {
    it('selects the id and sku of the product', () => {
      const builder = new ProductStockPersistenceProductBuilder(baseBuilder);

      builder.forById('100');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id`, `Product`.`sku` AS `Product_sku` FROM `product` `Product` WHERE ( `Product`.`id` = ? ) AND ( `Product`.`deletedAt` IS NULL )',
        ['100'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ProductStockPersistenceProductBuilder(baseBuilder);
      const chained = builder.forById('100');

      expect(chained).toBe(builder);
    });
  });
});
