import { QueueErrorCodeEnum } from '../enums/queue-error-code.enum';

import { QueueBaseException } from './base/queue-base.exception';

export class QueueJobNotFoundException extends QueueBaseException {
  public readonly code = QueueErrorCodeEnum.QUEUE_JOB_NOT_FOUND;

  constructor(
    queueName: string,
    jobId: string,
    message = `Job ${jobId} was not found in queue ${queueName}`,
  ) {
    super(message);
  }
}
