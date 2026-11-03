import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductCoreWriteUpdateCommand {
  id: string;
  versionAsRead: number;
  status: ProductStatusEnum;
  version: number;
}
