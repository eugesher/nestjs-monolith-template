import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import { LedgerEntryModel } from '../../domain';
import {
  LEDGER_LIST_ENTRIES_REPOSITORY_PORT,
  type ILedgerListEntriesRepositoryPort,
} from '../../outbound';
import type { ILedgerListEntriesCommand, ILedgerListEntriesView } from '../interfaces';

@Injectable()
export class LedgerListEntriesUseCase {
  constructor(
    @Inject(LEDGER_LIST_ENTRIES_REPOSITORY_PORT)
    private readonly repository: ILedgerListEntriesRepositoryPort,
  ) {}

  public async execute(command: ILedgerListEntriesCommand): Promise<ILedgerListEntriesView> {
    const { page, limit, subjectType, subjectId, correlationId } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);

    const [records, total] = await this.repository.list({
      ...pageWindow,
      subjectType,
      subjectId,
      correlationId,
    });
    const data = records.map((record) => {
      const entry = LedgerEntryModel.reconstitute(record);

      return entry.toSnapshot();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
