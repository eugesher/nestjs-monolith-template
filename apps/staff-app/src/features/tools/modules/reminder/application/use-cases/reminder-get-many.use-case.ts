import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';

import { ReminderModel } from '../../domain';
import {
  REMINDER_GET_MANY_REPOSITORY_PORT,
  type IReminderGetManyRepositoryPort,
} from '../../outbound';
import { IReminderGetManyCommand, IReminderView } from '../interfaces';

@Injectable()
export class ReminderGetManyUseCase {
  constructor(
    @Inject(REMINDER_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IReminderGetManyRepositoryPort,
  ) {}

  public async execute(command: IReminderGetManyCommand): Promise<IPage<IReminderView>> {
    const { page, limit, ownerId, status } = command;
    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [records, total] = await this.repository.list({ ...pageWindow, ownerId, status });
    const data = records.map((record) => {
      const reminder = ReminderModel.reconstitute(record);

      return reminder.toView();
    });

    return PaginationHelper.toPage(data, total, pageWindow);
  }
}
