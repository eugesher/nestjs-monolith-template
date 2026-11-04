import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductCoreWriteUpdateQuery {
  id: string;
  versionAsRead: number;
  status: ProductStatusEnum;
  version: number;
}
