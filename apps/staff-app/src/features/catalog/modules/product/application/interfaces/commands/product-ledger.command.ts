import { DomainEvent } from '@acme-libs/toolkit';

export interface IProductLedgerRecordEventsCommand {
  productId: string;
  events: DomainEvent<string>[];
}

export interface IProductLedgerRecordCreatedCommand {
  productId: string;
  sku: string;
  name: string;
}
