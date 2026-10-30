import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import {
  type ILedgerListEntriesRepositoryPort,
  LEDGER_LIST_ENTRIES_REPOSITORY_PORT,
} from '../../outbound';
import { ILedgerEntryView, ILedgerListEntriesQuery } from '../interfaces';

@Injectable()
export class LedgerListEntriesUseCase {
  constructor(
    @Inject(LEDGER_LIST_ENTRIES_REPOSITORY_PORT)
    private readonly repository: ILedgerListEntriesRepositoryPort,
  ) {}

  public execute(query: ILedgerListEntriesQuery): Promise<IPage<ILedgerEntryView>> {
    const { page, size, subjectType, subjectId, correlationId } = query;
    const window = PaginationHelper.clampPageWindow(page, size);

    return this.repository.list({ ...window, subjectType, subjectId, correlationId });
  }
}
