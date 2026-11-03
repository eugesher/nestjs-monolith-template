import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { ReminderModel } from '../../domain';
import {
  type IReminderGetManyRepositoryPort,
  REMINDER_GET_MANY_REPOSITORY_PORT,
} from '../../outbound';
import { IReminderGetManyQuery, IReminderView } from '../interfaces';

@Injectable()
export class ReminderGetManyUseCase {
  constructor(
    @Inject(REMINDER_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IReminderGetManyRepositoryPort,
  ) {}

  public async execute(query: IReminderGetManyQuery): Promise<IPage<IReminderView>> {
    const { page, size, ownerId, status } = query;
    const window = PaginationHelper.clampPageWindow(page, size);
    const [records, total] = await this.repository.list({ ...window, ownerId, status });
    const data = records.map((record) => {
      const reminder = ReminderModel.reconstitute(record);

      return reminder.toView();
    });

    return PaginationHelper.toPage(data, total, window);
  }
}
