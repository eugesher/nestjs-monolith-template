import { Inject, Injectable } from '@nestjs/common';

import { QUEUE_REGISTRY_PORT, type IQueueRegistryPort } from '../../outbound';
import { IQueueRetryFailedJobCommand } from '../interfaces';
import { QueueFailedJobService } from '../services/queue-failed-job.service';

@Injectable()
export class QueueRetryFailedJobUseCase {
  constructor(
    private readonly failedJobService: QueueFailedJobService,
    @Inject(QUEUE_REGISTRY_PORT)
    private readonly registry: IQueueRegistryPort,
  ) {}

  public async execute(command: IQueueRetryFailedJobCommand): Promise<void> {
    const { queueName, jobId } = command;

    await this.failedJobService.ensure({ queueName, jobId });
    await this.registry.retryJob({ queueName, jobId });
  }
}
