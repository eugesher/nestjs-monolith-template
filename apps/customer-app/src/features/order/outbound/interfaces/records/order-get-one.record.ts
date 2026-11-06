import { Order, OrderProduct, Product } from '@acme-core/entities';

export type IOrderGetOneRecord = Pick<Order, 'id' | 'createdAt'> & {
  orderProducts: (Pick<OrderProduct, 'id' | 'productId'> & {
    product: Pick<Product, 'sku' | 'name'>;
  })[];
};
