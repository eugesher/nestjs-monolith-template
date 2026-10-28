import { Inject, Injectable } from '@nestjs/common';

import { ILedgerCoreEntryView, ILedgerCoreListEntriesQuery } from '@acme-core/contracts/ledger';
import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import {
  type ILedgerCoreListEntriesRepositoryPort,
  LEDGER_CORE_LIST_ENTRIES_REPOSITORY_PORT,
} from '../../outbound';
import { LedgerCoreEntryViewMapper } from '../mappers/ledger-core-entry-view.mapper';

@Injectable()
export class LedgerCoreListEntriesUseCase {
  constructor(
    @Inject(LEDGER_CORE_LIST_ENTRIES_REPOSITORY_PORT)
    private readonly repository: ILedgerCoreListEntriesRepositoryPort,
  ) {}

  public async execute(query: ILedgerCoreListEntriesQuery): Promise<IPage<ILedgerCoreEntryView>> {
    const { page, size, subjectType, subjectId, correlationId } = query;
    const window = PaginationHelper.clampPageWindow(page, size);
    const result = await this.repository.list({
      page: window.page,
      size: window.size,
      subjectType,
      subjectId,
      correlationId,
    });

    return {
      items: result.items.map((entry) => LedgerCoreEntryViewMapper.toView(entry)),
      total: result.total,
      page: result.page,
      size: result.size,
    };
  }
}
