import { QueueErrorCodeEnum } from '../enums/queue-error-code.enum';

import { QueueBaseException } from './base/queue-base.exception';

export class QueueJobNotFailedException extends QueueBaseException {
  public readonly code = QueueErrorCodeEnum.QUEUE_JOB_NOT_FAILED;

  constructor(
    queueName: string,
    jobId: string,
    state: string,
    message = `Job ${jobId} of queue ${queueName} is ${state}, not failed`,
  ) {
    super(message);
  }
}
