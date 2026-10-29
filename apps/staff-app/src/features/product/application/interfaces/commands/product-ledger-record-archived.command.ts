import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export interface IProductLedgerRecordArchivedCommand {
  productId: string;
  events: DomainEvent<Maybe<string>>[];
}
