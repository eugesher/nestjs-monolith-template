import { Order, OrderProduct, Product } from '@acme-core/entities';

type IOrderGetOneRecordProduct = Pick<Product, 'sku' | 'name'>;

interface IOrderGetOneRecordOrderProduct extends Pick<OrderProduct, 'id' | 'productId'> {
  product: IOrderGetOneRecordProduct;
}

export interface IOrderGetOneRecord extends Pick<Order, 'id' | 'customerId' | 'createdAt'> {
  orderProducts: IOrderGetOneRecordOrderProduct[];
}
