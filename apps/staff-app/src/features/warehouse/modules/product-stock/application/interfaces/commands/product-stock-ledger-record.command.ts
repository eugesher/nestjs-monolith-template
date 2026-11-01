import { DomainEvent } from '@acme-libs/toolkit';

export interface IProductStockLedgerRecordCommand {
  productId: string;
  productStockId: string;
  events: DomainEvent<string>[];
}
