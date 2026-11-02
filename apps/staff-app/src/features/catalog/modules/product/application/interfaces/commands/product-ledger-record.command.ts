import { DomainEvent } from '@acme-libs/toolkit';

export interface IProductLedgerRecordCommand {
  productId: string;
  events: DomainEvent<string>[];
}
