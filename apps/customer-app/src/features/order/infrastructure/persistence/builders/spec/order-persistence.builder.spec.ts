import { DataSource, SelectQueryBuilder } from 'typeorm';

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
    it(
      'selects the id and creation time of the orders of the customer, ' +
        'newest first, inside the page window',
      () => {
        const builder = new OrderPersistenceBuilder(baseBuilder);

        builder.forList({ page: 3, limit: 20, offset: 40, customerId: '7' });

        expect(builder.getQueryAndParameters()).toEqual([
          'SELECT `Order`.`id` AS `Order_id`, `Order`.`createdAt` AS `Order_createdAt` ' +
            'FROM `order` `Order` ' +
            'WHERE `Order`.`customerId` = ? ' +
            'ORDER BY `Order_id` DESC ' +
            'LIMIT 20 OFFSET 40',
          ['7'],
        ]);
      },
    );

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);
      const chained = builder.forList({ page: 1, limit: 10, offset: 0, customerId: '7' });

      expect(chained).toBe(builder);
    });
  });

  describe('forOwned', () => {
    it('selects the order of the customer with its products in insertion order', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);

      builder.forOwned({ orderId: '600', customerId: '7' });

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Order`.`id` AS `Order_id`, `Order`.`createdAt` AS `Order_createdAt`, ' +
          '`OrderProduct`.`id` AS `OrderProduct_id`, ' +
          '`OrderProduct`.`productId` AS `OrderProduct_productId`, ' +
          '`Product`.`id` AS `Product_id`, `Product`.`sku` AS ' +
          '`Product_sku`, `Product`.`name` AS `Product_name` ' +
          'FROM `order` `Order` ' +
          'LEFT JOIN `order_product` `OrderProduct` ON `OrderProduct`.`order_id`=`Order`.`id` ' +
          'LEFT JOIN `product` `Product` ON `Product`.`id`=`OrderProduct`.`product_id` ' +
          'AND (`Product`.`deletedAt` IS NULL) ' +
          'WHERE `Order`.`id` = ? AND `Order`.`customerId` = ? ' +
          'ORDER BY `OrderProduct_id` ASC',
        ['600', '7'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);
      const chained = builder.forOwned({ orderId: '600', customerId: '7' });

      expect(chained).toBe(builder);
    });
  });

  describe('forPlaced', () => {
    it('selects the order by id with its products in insertion order', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);

      builder.forPlaced('600');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `Order`.`id` AS `Order_id`, `Order`.`createdAt` AS `Order_createdAt`, ' +
          '`OrderProduct`.`id` AS `OrderProduct_id`, ' +
          '`OrderProduct`.`productId` AS `OrderProduct_productId`, ' +
          '`Product`.`id` AS `Product_id`, `Product`.`sku` AS ' +
          '`Product_sku`, `Product`.`name` AS `Product_name` ' +
          'FROM `order` `Order` ' +
          'LEFT JOIN `order_product` `OrderProduct` ON `OrderProduct`.`order_id`=`Order`.`id` ' +
          'LEFT JOIN `product` `Product` ON `Product`.`id`=`OrderProduct`.`product_id` ' +
          'AND (`Product`.`deletedAt` IS NULL) ' +
          'WHERE `Order`.`id` = ? ' +
          'ORDER BY `OrderProduct_id` ASC',
        ['600'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new OrderPersistenceBuilder(baseBuilder);
      const chained = builder.forPlaced('600');

      expect(chained).toBe(builder);
    });
  });
});
