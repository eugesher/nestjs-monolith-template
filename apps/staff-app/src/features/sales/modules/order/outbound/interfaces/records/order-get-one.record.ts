import type { Order, OrderProduct, Product } from '@acme-core/entities';

export type IOrderGetOneRecord = Pick<Order, 'id' | 'customerId' | 'createdAt'> & {
  orderProducts: (Pick<OrderProduct, 'id' | 'productId'> & {
    product: Pick<Product, 'sku' | 'name'>;
  })[];
};
