export interface ILedgerCatalogEventsRecordItemCreatedCommand {
  itemId: string;
  sku: string;
  name: string;
  ownerId: string;
  occurredAt: string;
}
