import { Order, OrderProduct, Product } from '@acme-core/entities';

type IOrderPlaceProductRecordItem = Pick<Product, 'id'>;

export type IOrderPlaceProductRecord = IOrderPlaceProductRecordItem[];

type IOrderPlaceOrderRecordProduct = Pick<Product, 'sku' | 'name'>;

interface IOrderPlaceOrderRecordOrderProduct extends Pick<OrderProduct, 'id' | 'productId'> {
  product: IOrderPlaceOrderRecordProduct;
}

export interface IOrderPlaceOrderRecord extends Pick<Order, 'id' | 'customerId' | 'createdAt'> {
  orderProducts: IOrderPlaceOrderRecordOrderProduct[];
}
