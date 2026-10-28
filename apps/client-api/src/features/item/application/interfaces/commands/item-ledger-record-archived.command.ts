import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export interface IItemLedgerRecordArchivedCommand {
  itemId: string;
  sku: string;
  events: DomainEvent<Maybe<string>>[];
}
