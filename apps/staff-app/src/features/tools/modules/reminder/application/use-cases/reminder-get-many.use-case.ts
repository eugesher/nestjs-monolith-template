import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper, type IPage } from '@acme-libs/toolkit';

import { ReminderGetManyModel } from '../../domain';
import {
  REMINDER_GET_MANY_REPOSITORY_PORT,
  type IReminderGetManyRepositoryPort,
} from '../../outbound';
import type { IReminderGetManyCommand, IReminderView } from '../interfaces';

@Injectable()
export class ReminderGetManyUseCase {
  constructor(
    @Inject(REMINDER_GET_MANY_REPOSITORY_PORT)
    private readonly repository: IReminderGetManyRepositoryPort,
  ) {}

  public async execute(command: IReminderGetManyCommand): Promise<IPage<IReminderView>> {
    const { ownerId, status } = command;
    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const [records, total] = await this.repository.list({ limit, offset, ownerId, status });
    const data = ReminderGetManyModel.toViewData(records);

    return PaginationHelper.toPage({ data, page, limit, total });
  }
}
