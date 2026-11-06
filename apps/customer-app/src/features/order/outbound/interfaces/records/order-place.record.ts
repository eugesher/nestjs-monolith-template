import { Order, OrderProduct, Product } from '@acme-core/entities';

export type IOrderPlaceProductRecord = Pick<Product, 'id'>;

export type IOrderPlaceRecord = Pick<Order, 'id' | 'createdAt'> & {
  orderProducts: (Pick<OrderProduct, 'id' | 'productId'> & {
    product: Pick<Product, 'sku' | 'name'>;
  })[];
};
