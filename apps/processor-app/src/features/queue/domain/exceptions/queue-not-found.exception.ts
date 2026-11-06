import { QueueExceptionCodeEnum } from '../enums/queue-exception-code.enum';

import { QueueBaseException } from './base/queue-base.exception';

export class QueueNotFoundException extends QueueBaseException {
  public readonly code = QueueExceptionCodeEnum.QUEUE_NOT_FOUND;

  constructor(queueName: string, message = `Queue ${queueName} was not found`) {
    super(message);
  }
}
