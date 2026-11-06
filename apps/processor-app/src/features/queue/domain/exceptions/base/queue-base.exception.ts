import { DomainException } from '@acme-libs/toolkit';

import { QueueExceptionCodeEnum } from '../../enums/queue-exception-code.enum';

export abstract class QueueBaseException extends DomainException {
  public abstract override readonly code: QueueExceptionCodeEnum;
}
