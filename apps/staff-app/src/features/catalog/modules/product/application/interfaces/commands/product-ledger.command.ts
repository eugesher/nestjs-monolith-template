import { DomainEvent } from '@acme-libs/toolkit';

export interface IProductLedgerRecordEventsCommand {
  events: DomainEvent<string>[];
}

export interface IProductLedgerRecordCreatedCommand {
  productId: string;
  sku: string;
  name: string;
}
