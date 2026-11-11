import type { Order, OrderProduct } from '@acme-core/entities';

export type IOrderPlaceInsertQuery = Pick<Order, 'customerId'>;

export type IOrderPlaceOrderProductInsertQuery = Pick<OrderProduct, 'orderId' | 'productId'>;
