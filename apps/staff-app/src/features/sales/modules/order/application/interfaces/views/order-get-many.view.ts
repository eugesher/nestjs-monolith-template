import { IPage } from '@acme-libs/toolkit';

export type IOrderGetManyView = IPage<{
  id: string;
  customerId: string;
  createdAt: string;
}>;
