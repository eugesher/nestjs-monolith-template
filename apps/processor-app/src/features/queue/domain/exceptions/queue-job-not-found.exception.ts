import { QueueExceptionCodeEnum } from '../enums/queue-exception-code.enum';

import { QueueBaseException } from './base/queue-base.exception';

export class QueueJobNotFoundException extends QueueBaseException {
  public readonly code = QueueExceptionCodeEnum.QUEUE_JOB_NOT_FOUND;

  constructor(
    queueName: string,
    jobId: string,
    message = `Job ${jobId} was not found in queue ${queueName}`,
  ) {
    super(message);
  }
}
