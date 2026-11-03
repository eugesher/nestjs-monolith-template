import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductInsertCommand {
  sku: string;
  name: string;
  status: ProductStatusEnum;
  version: number;
}
