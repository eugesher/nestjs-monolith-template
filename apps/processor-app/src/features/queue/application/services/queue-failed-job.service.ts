import { Inject, Injectable } from '@nestjs/common';

import {
  QueueJobNotFailedException,
  QueueJobNotFoundException,
  QueueNotFoundException,
} from '../../domain';
import { QUEUE_REGISTRY_PORT, type IQueueRegistryPort } from '../../outbound';
import { IQueueFailedJobEnsureCommand } from '../interfaces';

@Injectable()
export class QueueFailedJobService {
  private static readonly FAILED_STATE = 'failed';

  constructor(
    @Inject(QUEUE_REGISTRY_PORT)
    private readonly registry: IQueueRegistryPort,
  ) {}

  public async ensure(command: IQueueFailedJobEnsureCommand): Promise<void> {
    const { queueName, jobId } = command;

    if (!this.registry.has(queueName)) {
      throw new QueueNotFoundException(queueName);
    }

    const state = await this.registry.findJobState({ queueName, jobId });

    if (!state) {
      throw new QueueJobNotFoundException(queueName, jobId);
    }

    if (state !== QueueFailedJobService.FAILED_STATE) {
      throw new QueueJobNotFailedException(queueName, jobId, state);
    }
  }
}
