import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import { type IReminderCrudRepositoryPort, REMINDER_CRUD_REPOSITORY_PORT } from '../../outbound';
import { IReminderGetManyQuery, IReminderView } from '../interfaces';
import { ReminderViewMapper } from '../mappers/reminder-view.mapper';

@Injectable()
export class ReminderGetManyUseCase {
  constructor(
    @Inject(REMINDER_CRUD_REPOSITORY_PORT)
    private readonly repository: IReminderCrudRepositoryPort,
  ) {}

  public async execute(query: IReminderGetManyQuery): Promise<IPage<IReminderView>> {
    const { page, size, ownerId, status } = query;
    const window = PaginationHelper.clampPageWindow(page, size);
    const result = await this.repository.list({ ...window, ownerId, status });
    const items = result.items.map((reminder) => ReminderViewMapper.toView(reminder));

    return { items, total: result.total, page: result.page, size: result.size };
  }
}
