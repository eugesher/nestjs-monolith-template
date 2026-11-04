import { Order, OrderProduct } from '@acme-core/entities';

export type IOrderPlaceOrderInsertQuery = Pick<Order, 'customerId'>;

export type IOrderPlaceOrderProductInsertQuery = Pick<OrderProduct, 'orderId' | 'productId'>;
