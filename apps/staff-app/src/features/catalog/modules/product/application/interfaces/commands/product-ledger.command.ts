import { DomainEvent } from '@acme-libs/toolkit';

export interface IProductLedgerRecordCommand {
  productId: string;
  events: DomainEvent<string>[];
}

export interface IProductLedgerRecordCreatedCommand {
  productId: string;
  sku: string;
  name: string;
}
