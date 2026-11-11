import type { Order } from '@acme-core/entities';

export type IOrderGetManyRecordItem = Pick<Order, 'id' | 'createdAt'>;

export type IOrderGetManyRecord = [IOrderGetManyRecordItem[], number];
