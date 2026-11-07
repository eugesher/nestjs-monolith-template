import { DataSource, SelectQueryBuilder } from 'typeorm';

import { Product } from '@acme-core/entities';

import { ProductPersistenceBuilder } from '../product-persistence.builder';

describe('ProductPersistenceBuilder', () => {
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
    it('selects the product by id', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);

      builder.forById('100');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id`, `Product`.`sku` AS `Product_sku`, ' +
          '`Product`.`name` AS `Product_name`, `Product`.`status` AS `Product_status`, ' +
          '`Product`.`version` AS `Product_version`, ' +
          '`Product`.`createdAt` AS `Product_createdAt`, ' +
          '`Product`.`updatedAt` AS `Product_updatedAt` ' +
          'FROM `product` `Product` ' +
          'WHERE ( `Product`.`id` = ? ) AND ( `Product`.`deletedAt` IS NULL )',
        ['100'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);
      const chained = builder.forById('100');

      expect(chained).toBe(builder);
    });
  });

  describe('forExistsBySku', () => {
    it('filters the products by sku', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);

      builder.forExistsBySku('SKU-0001');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id`, `Product`.`sku` AS `Product_sku`, ' +
          '`Product`.`name` AS `Product_name`, `Product`.`status` AS `Product_status`, ' +
          '`Product`.`version` AS `Product_version`, ' +
          '`Product`.`createdAt` AS `Product_createdAt`, ' +
          '`Product`.`updatedAt` AS `Product_updatedAt`, ' +
          '`Product`.`deletedAt` AS `Product_deletedAt` ' +
          'FROM `product` `Product` ' +
          'WHERE ( `Product`.`sku` = ? ) AND ( `Product`.`deletedAt` IS NULL )',
        ['SKU-0001'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);
      const chained = builder.forExistsBySku('SKU-0001');

      expect(chained).toBe(builder);
    });
  });

  describe('forInserted', () => {
    it('selects the inserted product by id', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);

      builder.forInserted('100');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id`, `Product`.`sku` AS `Product_sku`, ' +
          '`Product`.`name` AS `Product_name`, `Product`.`status` AS `Product_status`, ' +
          '`Product`.`version` AS `Product_version`, ' +
          '`Product`.`createdAt` AS `Product_createdAt`, ' +
          '`Product`.`updatedAt` AS `Product_updatedAt` ' +
          'FROM `product` `Product` ' +
          'WHERE ( `Product`.`id` = ? ) AND ( `Product`.`deletedAt` IS NULL )',
        ['100'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);
      const chained = builder.forInserted('100');

      expect(chained).toBe(builder);
    });
  });

  describe('forList', () => {
    it('selects every product newest first inside the page window', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);

      builder.forList({ page: 3, limit: 20, offset: 40, productIds: undefined });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id`, `Product`.`sku` AS `Product_sku`, ' +
          '`Product`.`name` AS `Product_name`, `Product`.`status` AS `Product_status`, ' +
          '`Product`.`version` AS `Product_version`, ' +
          '`Product`.`createdAt` AS `Product_createdAt`, ' +
          '`Product`.`updatedAt` AS `Product_updatedAt` ' +
          'FROM `product` `Product` ' +
          'WHERE `Product`.`deletedAt` IS NULL ' +
          'ORDER BY `Product_id` DESC ' +
          'LIMIT 20 OFFSET 40',
        [],
      ]);
    });

    it('keeps only the given products', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);

      builder.forList({ page: 1, limit: 20, offset: 0, productIds: ['100', '101'] });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id`, `Product`.`sku` AS `Product_sku`, ' +
          '`Product`.`name` AS `Product_name`, `Product`.`status` AS `Product_status`, ' +
          '`Product`.`version` AS `Product_version`, ' +
          '`Product`.`createdAt` AS `Product_createdAt`, ' +
          '`Product`.`updatedAt` AS `Product_updatedAt` ' +
          'FROM `product` `Product` ' +
          'WHERE ( `Product`.`id` IN (?, ?) ) AND ( `Product`.`deletedAt` IS NULL ) ' +
          'ORDER BY `Product_id` DESC ' +
          'LIMIT 20 OFFSET 0',
        ['100', '101'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);
      const chained = builder.forList({ page: 3, limit: 20, offset: 40, productIds: undefined });

      expect(chained).toBe(builder);
    });
  });

  describe('forLockById', () => {
    it('selects the id of the product under an exclusive lock', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);

      builder.forLockById('100');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Product`.`id` AS `Product_id` ' +
          'FROM `product` `Product` ' +
          'WHERE ( `Product`.`id` = ? ) AND ( `Product`.`deletedAt` IS NULL ) ' +
          'FOR UPDATE',
        ['100'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new ProductPersistenceBuilder(baseBuilder);
      const chained = builder.forLockById('100');

      expect(chained).toBe(builder);
    });
  });
});
