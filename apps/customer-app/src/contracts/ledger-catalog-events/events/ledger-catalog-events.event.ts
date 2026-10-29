import { ItemStatusEnum } from '@acme-libs/kernel';

export const LEDGER_CATALOG_EVENTS = {
  ITEM_CREATED: 'catalog.item.created',
  ITEM_RENAMED: 'catalog.item.renamed',
  ITEM_ARCHIVED: 'catalog.item.archived',
} as const;

export interface ILedgerCatalogEventsItemCreatedProcessorPayload {
  itemId: string;
  sku: string;
  name: string;
  ownerId: string;
  occurredAt: string;
}

export interface ILedgerCatalogEventsItemRenamedProcessorPayload {
  itemId: string;
  name: string;
  previousName: string;
  occurredAt: string;
}

export interface ILedgerCatalogEventsItemArchivedProcessorPayload {
  itemId: string;
  sku: string;
  previousStatus: ItemStatusEnum;
  occurredAt: string;
}
