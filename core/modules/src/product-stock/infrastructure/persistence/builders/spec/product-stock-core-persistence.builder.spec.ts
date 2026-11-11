import { DataSource, type SelectQueryBuilder } from 'typeorm';

import { Customer, Order, OrderProduct, Product, ProductStock } from '@acme-core/entities';

import { ProductStockCorePersistenceBuilder } from '../product-stock-core-persistence.builder';

describe('ProductStockCorePersistenceBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<ProductStock>;

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

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(ProductStock).createQueryBuilder(ProductStock.name);
  });

  describe('forSumStock', () => {
    it('sums the stock of every given product under a shared lock', () => {
      const builder = new ProductStockCorePersistenceBuilder(baseBuilder);

      builder.forSumStock(['100', '101']);

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `ProductStock`.`productId` AS `productId`, ' +
          'SUM(`ProductStock`.`quantity`) AS `quantity` ' +
          'FROM `product_stock` `ProductStock` ' +
          'WHERE `ProductStock`.`productId` IN (?, ?) ' +
          'GROUP BY `ProductStock`.`productId` ' +
          'LOCK IN SHARE MODE',
        ['100', '101'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ProductStockCorePersistenceBuilder(baseBuilder);
      const chained = builder.forSumStock(['100', '101']);

      expect(chained).toBe(builder);
    });
  });
});
