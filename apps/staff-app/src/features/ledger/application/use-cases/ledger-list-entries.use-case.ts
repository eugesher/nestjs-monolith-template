import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import { LedgerListEntriesModel } from '../../domain';
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
    const { subjectType, subjectId, correlationId } = command;
    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const [records, total] = await this.repository.list({
      limit,
      offset,
      subjectType,
      subjectId,
      correlationId,
    });
    const data = LedgerListEntriesModel.toViewData(records);

    return PaginationHelper.toPage({ data, page, limit, total });
  }
}
