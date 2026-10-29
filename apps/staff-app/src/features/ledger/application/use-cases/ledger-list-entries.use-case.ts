import { Inject, Injectable } from '@nestjs/common';

import { IPage } from '@acme-libs/toolkit';
import { type ILedgerQueryPort, LEDGER_QUERY_PORT } from '../../outbound';
import { ILedgerEntryView, ILedgerListEntriesQuery } from '../interfaces';

@Injectable()
export class LedgerListEntriesUseCase {
  constructor(
    @Inject(LEDGER_QUERY_PORT)
    private readonly ledger: ILedgerQueryPort,
  ) {}

  public execute(query: ILedgerListEntriesQuery): Promise<IPage<ILedgerEntryView>> {
    const { page, size, subjectType, subjectId, correlationId } = query;

    return this.ledger.list({ page, size, subjectType, subjectId, correlationId });
  }
}
