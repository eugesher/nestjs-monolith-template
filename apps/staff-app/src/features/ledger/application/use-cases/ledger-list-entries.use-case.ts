import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import {
  type ILedgerListEntriesRepositoryPort,
  LEDGER_LIST_ENTRIES_REPOSITORY_PORT,
} from '../../outbound';
import { ILedgerListEntriesView, ILedgerListEntriesCommand } from '../interfaces';
import { LedgerViewMapper } from '../mappers/ledger-view.mapper';

@Injectable()
export class LedgerListEntriesUseCase {
  constructor(
    @Inject(LEDGER_LIST_ENTRIES_REPOSITORY_PORT)
    private readonly repository: ILedgerListEntriesRepositoryPort,
  ) {}

  public async execute(command: ILedgerListEntriesCommand): Promise<ILedgerListEntriesView> {
    const { page, limit, subjectType, subjectId, correlationId } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);

    const [entries, total] = await this.repository.list({
      ...pageWindow,
      subjectType,
      subjectId,
      correlationId,
    });
    const data = entries.map((entry) => LedgerViewMapper.toListEntriesViewItem(entry));

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
