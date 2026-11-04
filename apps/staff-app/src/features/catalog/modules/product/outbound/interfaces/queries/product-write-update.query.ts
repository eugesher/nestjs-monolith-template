import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductWriteUpdateQuery {
  id: string;
  versionAsRead: number;
  name: string;
  status: ProductStatusEnum;
  version: number;
}
