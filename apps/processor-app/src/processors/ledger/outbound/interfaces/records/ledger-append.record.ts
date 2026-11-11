import type { LedgerEntry } from '@acme-core/entities';

import type { LedgerAppendEntryInsertOutcomeEnum } from '../../enums/ledger-append-entry-insert-outcome.enum';

export type ILedgerAppendEntryRecord = Pick<LedgerEntry, 'id'>;

export type ILedgerAppendEntryInsertRecord =
  | (Pick<LedgerEntry, 'id'> & { outcome: LedgerAppendEntryInsertOutcomeEnum.INSERTED })
  | { outcome: LedgerAppendEntryInsertOutcomeEnum.DUPLICATE };
