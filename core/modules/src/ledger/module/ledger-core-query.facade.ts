import { Injectable } from '@nestjs/common';

import {
  ILedgerCoreEntryView,
  ILedgerCoreListEntriesQuery,
  ILedgerCoreQueryPort,
} from '@acme-core/contracts/ledger';
import { IPage } from '@acme-libs/toolkit';
import { LedgerCoreListEntriesUseCase } from '../application';

@Injectable()
export class LedgerCoreQueryFacade implements ILedgerCoreQueryPort {
  constructor(private readonly ledgerCoreListEntries: LedgerCoreListEntriesUseCase) {}

  public list(query: ILedgerCoreListEntriesQuery): Promise<IPage<ILedgerCoreEntryView>> {
    return this.ledgerCoreListEntries.execute(query);
  }
}
