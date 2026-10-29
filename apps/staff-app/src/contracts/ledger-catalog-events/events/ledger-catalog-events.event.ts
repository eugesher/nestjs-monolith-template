import { ProductStatusEnum } from '@acme-libs/kernel';

export const LEDGER_CATALOG_EVENTS = {
  PRODUCT_CREATED: 'catalog.product.created',
  PRODUCT_RENAMED: 'catalog.product.renamed',
  PRODUCT_ARCHIVED: 'catalog.product.archived',
} as const;

export interface ILedgerCatalogEventsProductCreatedProcessorPayload {
  productId: string;
  sku: string;
  name: string;
  occurredAt: string;
}

export interface ILedgerCatalogEventsProductRenamedProcessorPayload {
  productId: string;
  name: string;
  previousName: string;
  occurredAt: string;
}

export interface ILedgerCatalogEventsProductArchivedProcessorPayload {
  productId: string;
  sku: string;
  previousStatus: ProductStatusEnum;
  occurredAt: string;
}
