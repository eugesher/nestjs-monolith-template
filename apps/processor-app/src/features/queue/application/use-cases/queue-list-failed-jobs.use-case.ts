import { Inject, Injectable } from '@nestjs/common';

import { PaginationHelper } from '@acme-libs/toolkit';

import { QueueNotFoundException } from '../../domain';
import { QUEUE_REGISTRY_PORT, type IQueueRegistryPort } from '../../outbound';
import type { IQueueListFailedJobsCommand, IQueueListFailedJobsView } from '../interfaces';

@Injectable()
export class QueueListFailedJobsUseCase {
  constructor(
    @Inject(QUEUE_REGISTRY_PORT)
    private readonly registry: IQueueRegistryPort,
  ) {}

  public async execute(command: IQueueListFailedJobsCommand): Promise<IQueueListFailedJobsView> {
    const { queueName } = command;

    if (!this.registry.has(queueName)) {
      throw new QueueNotFoundException(queueName);
    }

    const { limit, offset, page } = PaginationHelper.clampPageWindow({ query: command });
    const [data, total] = await this.registry.findFailedJobs({ queueName, offset, limit });

    return PaginationHelper.toPage({ data, page, limit, total });
  }
}
