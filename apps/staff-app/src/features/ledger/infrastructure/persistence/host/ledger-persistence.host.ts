import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { LedgerEntry } from '@acme-core/entities';
import { LedgerPersistenceLedgerEntryBuilder } from '../builders/ledger-persistence-ledger-entry.builder';

export abstract class LedgerPersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get ledgerEntryRepository(): IHostedRepository<LedgerEntry> {
    return this.repositoryHost.getRepository(LedgerEntry);
  }

  protected createLedgerEntryBuilder(): LedgerPersistenceLedgerEntryBuilder {
    return new LedgerPersistenceLedgerEntryBuilder(
      this.ledgerEntryRepository.createQueryBuilder(LedgerEntry.name),
    );
  }
}
