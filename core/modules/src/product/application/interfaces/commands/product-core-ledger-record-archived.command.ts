import { ProductStatusEnum } from '@acme-libs/kernel';

export interface IProductCoreLedgerRecordArchivedCommand {
  productId: string;
  sku: string;
  version: number;
  previousStatus: ProductStatusEnum;
}
