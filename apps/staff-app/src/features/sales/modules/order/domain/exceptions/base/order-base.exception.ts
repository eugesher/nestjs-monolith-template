import { DomainException } from '@acme-libs/toolkit';

import { OrderErrorCodeEnum } from '../../enums/order-error-code.enum';

export abstract class OrderBaseException extends DomainException {
  public abstract override readonly code: OrderErrorCodeEnum;
}
