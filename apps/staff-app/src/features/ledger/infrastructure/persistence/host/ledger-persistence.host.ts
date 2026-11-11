import { LedgerEntry } from '@acme-core/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { LedgerPersistenceLedgerEntryBuilder } from '../builders/ledger-persistence-ledger-entry.builder';

export abstract class LedgerPersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get ledgerEntryRepository(): IHostedRepository<LedgerEntry> {
    return this.orm.getRepository(LedgerEntry);
  }

  protected createLedgerEntryBuilder(): LedgerPersistenceLedgerEntryBuilder {
    return new LedgerPersistenceLedgerEntryBuilder(
      this.ledgerEntryRepository.createQueryBuilder(LedgerEntry.name),
    );
  }
}
