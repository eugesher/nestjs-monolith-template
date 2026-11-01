import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export interface IProductLedgerRecordCommand {
  productId: string;
  events: DomainEvent<Maybe<string>>[];
}
