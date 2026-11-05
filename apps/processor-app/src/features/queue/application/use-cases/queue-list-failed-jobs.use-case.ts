import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import { QueueNotFoundException } from '../../domain';
import { type IQueueRegistryPort, QUEUE_REGISTRY_PORT } from '../../outbound';
import { IQueueListFailedJobsCommand, IQueueListFailedJobsView } from '../interfaces';

@Injectable()
export class QueueListFailedJobsUseCase {
  constructor(
    @Inject(QUEUE_REGISTRY_PORT)
    private readonly registry: IQueueRegistryPort,
  ) {}

  public async execute(command: IQueueListFailedJobsCommand): Promise<IQueueListFailedJobsView> {
    const { queueName, page, limit } = command;

    if (!this.registry.has(queueName)) {
      throw new QueueNotFoundException(queueName);
    }

    const pageWindow = PaginationHelper.clampPageWindow(page, limit);
    const [jobs, total] = await this.registry.findFailedJobs({
      queueName,
      offset: pageWindow.offset,
      limit: pageWindow.limit,
    });

    return PaginationHelper.toPage(jobs, total, pageWindow);
  }
}
