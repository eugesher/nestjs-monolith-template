import { Order } from '@acme-core/entities';

export type IOrderGetManyRecordItem = Pick<Order, 'id' | 'customerId' | 'createdAt'>;

export type IOrderGetManyRecord = [IOrderGetManyRecordItem[], number];
