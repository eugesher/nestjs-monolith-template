import { DomainEvent } from '@acme-libs/toolkit';

export interface IProductStockLedgerRecordEventsCommand {
  productStockId: string;
  events: DomainEvent<string>[];
}
