import { DomainEvent } from '@acme-libs/toolkit';

export interface IProductStockLedgerRecordEventsCommand {
  productId: string;
  productStockId: string;
  events: DomainEvent<string>[];
}
