import { DomainException } from '@acme-libs/toolkit';

import { QueueErrorCodeEnum } from '../../enums/queue-error-code.enum';

export abstract class QueueBaseException extends DomainException {
  public abstract override readonly code: QueueErrorCodeEnum;
}
