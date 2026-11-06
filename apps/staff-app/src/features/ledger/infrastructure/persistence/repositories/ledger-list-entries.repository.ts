import { Inject, Injectable } from '@nestjs/common';

import { type IRepositoryHostPort, REPOSITORY_HOST_PORT } from '@acme-libs/contracts/database';

import {
  ILedgerListEntriesQuery,
  ILedgerListEntriesRepositoryPort,
  ILedgerListEntriesRecord,
} from '../../../outbound';
import { LedgerPersistenceHost } from '../host/ledger-persistence.host';

@Injectable()
export class LedgerListEntriesRepository
  extends LedgerPersistenceHost
  implements ILedgerListEntriesRepositoryPort
{
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
