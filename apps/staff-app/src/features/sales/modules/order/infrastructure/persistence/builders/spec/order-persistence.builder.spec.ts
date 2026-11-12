import { DataSource, type SelectQueryBuilder } from 'typeorm';

import { Customer, Order, OrderProduct, Product } from '@acme-core/entities';

import { OrderPersistenceBuilder } from '../order-persistence.builder';

describe('OrderPersistenceBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<Order>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [Customer, Order, OrderProduct, Product],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(Order).createQueryBuilder(Order.name);
  });

  describe('forList', () => {
    it('selects every order newest first inside the page window', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);

      builder.forList({ page: 3, limit: 20, offset: 40, orderIds: undefined });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Order`.`id` AS `Order_id`, `Order`.`customerId` AS `Order_customerId`, `Order`.`createdAt` AS `Order_createdAt` FROM `order` `Order` ORDER BY `Order_id` DESC LIMIT 20 OFFSET 40',
        [],
      ]);
    });

    it('keeps only the given orders', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);

      builder.forList({ page: 1, limit: 20, offset: 0, orderIds: ['600', '601'] });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Order`.`id` AS `Order_id`, `Order`.`customerId` AS `Order_customerId`, `Order`.`createdAt` AS `Order_createdAt` FROM `order` `Order` WHERE `Order`.`id` IN (?, ?) ORDER BY `Order_id` DESC LIMIT 20 OFFSET 0',
        ['600', '601'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);
      const chained = builder.forList({ page: 3, limit: 20, offset: 40, orderIds: undefined });

      expect(chained).toBe(builder);
    });
  });

  describe('forById', () => {
    it('selects the order with its products in insertion order', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);

      builder.forById('600');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Order`.`id` AS `Order_id`, `Order`.`customerId` AS `Order_customerId`, `Order`.`createdAt` AS `Order_createdAt`, `OrderProduct`.`id` AS `OrderProduct_id`, `OrderProduct`.`productId` AS `OrderProduct_productId`, `Product`.`id` AS `Product_id`, `Product`.`sku` AS `Product_sku`, `Product`.`name` AS `Product_name` FROM `order` `Order` LEFT JOIN `order_product` `OrderProduct` ON `OrderProduct`.`order_id`=`Order`.`id` LEFT JOIN `product` `Product` ON `Product`.`id`=`OrderProduct`.`product_id` WHERE `Order`.`id` = ? ORDER BY `OrderProduct_id` ASC',
        ['600'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);
      const chained = builder.forById('600');

      expect(chained).toBe(builder);
    });
  });

  describe('forExisting', () => {
    it('selects the id of the order', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);

      builder.forExisting('600');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Order`.`id` AS `Order_id` FROM `order` `Order` WHERE `Order`.`id` = ?',
        ['600'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);
      const chained = builder.forExisting('600');

      expect(chained).toBe(builder);
    });
  });

  describe('forLockById', () => {
    it('selects the id of the order under an exclusive lock', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);

      builder.forLockById('600');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Order`.`id` AS `Order_id` FROM `order` `Order` WHERE `Order`.`id` = ? FOR UPDATE',
        ['600'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);
      const chained = builder.forLockById('600');

      expect(chained).toBe(builder);
    });
  });
});
