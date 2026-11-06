import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  ILedgerListEntriesQuery,
  ILedgerListEntriesRepositoryPort,
  ILedgerListEntriesRecord,
  LEDGER_LIST_ENTRIES_REPOSITORY_PORT,
} from '../../../outbound';
import { LedgerPersistenceHost } from '../host/ledger-persistence.host';

@Injectable()
export class LedgerListEntriesRepository
  extends LedgerPersistenceHost
  implements ILedgerListEntriesRepositoryPort
{
  public static readonly provider: ClassProvider<ILedgerListEntriesRepositoryPort> = {
    provide: LEDGER_LIST_ENTRIES_REPOSITORY_PORT,
    useClass: LedgerListEntriesRepository,
  };

  constructor(
    @Inject(REPOSITORY_HOST_PORT)
    protected readonly repositoryHost: IRepositoryHostPort,
  ) {
    super();
  }

  public async list(query: ILedgerListEntriesQuery): Promise<ILedgerListEntriesRecord> {
    return await this.createLedgerEntryBuilder().forList(query).getManyAndCount();
  }
}
