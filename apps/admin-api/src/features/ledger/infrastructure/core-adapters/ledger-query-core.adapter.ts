import { Inject, Injectable } from '@nestjs/common';

import { type ILedgerCoreQueryPort, LEDGER_CORE_QUERY_PORT } from '@acme-core/contracts/ledger';
import { IPage } from '@acme-libs/toolkit';
import {
  ILedgerQueryEntryView,
  ILedgerQueryListEntriesQuery,
  ILedgerQueryPort,
} from '../../outbound';

@Injectable()
export class LedgerQueryCoreAdapter implements ILedgerQueryPort {
  constructor(
    @Inject(LEDGER_CORE_QUERY_PORT)
    private readonly ledger: ILedgerCoreQueryPort,
  ) {}

  public list(query: ILedgerQueryListEntriesQuery): Promise<IPage<ILedgerQueryEntryView>> {
    const { page, size, subjectType, subjectId, correlationId } = query;

    return this.ledger.list({ page, size, subjectType, subjectId, correlationId });
  }
}
