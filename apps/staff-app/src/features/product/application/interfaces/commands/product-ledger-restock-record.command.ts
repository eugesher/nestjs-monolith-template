import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export interface IProductLedgerRestockRecordCommand {
  productId: string;
  productStockId: string;
  events: DomainEvent<Maybe<string>>[];
}
