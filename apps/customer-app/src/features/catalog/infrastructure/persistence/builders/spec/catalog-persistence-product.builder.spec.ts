import { DataSource, SelectQueryBuilder } from 'typeorm';

import { Product } from '@acme-core/entities';

import { CatalogPersistenceProductBuilder } from '../catalog-persistence-product.builder';

describe('CatalogPersistenceProductBuilder', () => {
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

  describe('forList', () => {
    it('selects the active products in id order inside the page window', () => {
      const builder = new CatalogPersistenceProductBuilder(baseBuilder);

      builder.forList({ page: 3, limit: 20, offset: 40 });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id`, `Product`.`sku` AS `Product_sku`, ' +
          '`Product`.`name` AS `Product_name` ' +
          'FROM `product` `Product` ' +
          'WHERE ( `Product`.`status` = ? ) AND ( `Product`.`deletedAt` IS NULL ) ' +
          'ORDER BY `Product_id` ASC ' +
          'LIMIT 20 OFFSET 40',
        ['active'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new CatalogPersistenceProductBuilder(baseBuilder);
      const chained = builder.forList({ page: 3, limit: 20, offset: 40 });

      expect(chained).toBe(builder);
    });
  });
});
