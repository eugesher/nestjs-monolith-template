import { IPage } from '@acme-libs/toolkit';

interface IOrderGetManyViewItem {
  id: string;
  customerId: string;
  createdAt: string;
}

export type IOrderGetManyView = IPage<IOrderGetManyViewItem>;
