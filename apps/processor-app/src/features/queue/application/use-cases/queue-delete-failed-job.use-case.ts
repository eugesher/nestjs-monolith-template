import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';

import { QUEUE_REGISTRY_PORT, type IQueueRegistryPort } from '../../outbound';
import { QueueFailedJobService } from '../services/queue-failed-job.service';
import type { IQueueDeleteFailedJobCommand } from '../interfaces';

@Injectable()
export class QueueDeleteFailedJobUseCase {
  constructor(
    private readonly failedJobService: QueueFailedJobService,
    @Inject(QUEUE_REGISTRY_PORT)
    private readonly registry: IQueueRegistryPort,
    @InjectPinoLogger(QueueDeleteFailedJobUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(command: IQueueDeleteFailedJobCommand): Promise<void> {
    const { queueName, jobId, staffUserId } = command;

    await this.failedJobService.ensure({ queueName, jobId });
    const data = await this.registry.removeJob({ queueName, jobId });

    this.logger.warn({ queueName, jobId, staffUserId, data }, 'Failed job deleted');
  }
}
