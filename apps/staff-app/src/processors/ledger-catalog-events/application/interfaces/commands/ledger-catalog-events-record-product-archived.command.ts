import { ProductStatusEnum } from '@acme-libs/kernel';

export interface ILedgerCatalogEventsRecordProductArchivedCommand {
  productId: string;
  sku: string;
  previousStatus: ProductStatusEnum;
  occurredAt: string;
}
