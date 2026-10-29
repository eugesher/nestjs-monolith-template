import { DomainEvent, Maybe } from '@acme-libs/toolkit';

export interface IItemLedgerRecordArchivedCommand {
  itemId: string;
  events: DomainEvent<Maybe<string>>[];
}
