import { ItemStatusEnum } from '@acme-libs/kernel';

export interface ILedgerCatalogEventsRecordItemArchivedCommand {
  itemId: string;
  sku: string;
  previousStatus: ItemStatusEnum;
  occurredAt: string;
}
