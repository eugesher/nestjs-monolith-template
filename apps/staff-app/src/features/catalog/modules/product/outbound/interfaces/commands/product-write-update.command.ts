import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductWriteUpdateCommand {
  id: string;
  versionAsRead: number;
  name: string;
  status: ProductStatusEnum;
  version: number;
}
