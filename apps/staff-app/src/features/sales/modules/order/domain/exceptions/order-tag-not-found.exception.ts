import { OrderExceptionCodeEnum } from '../enums/order-exception-code.enum';
import { OrderBaseException } from './base/order-base.exception';

export class OrderTagNotFoundException extends OrderBaseException {
  public readonly code = OrderExceptionCodeEnum.ORDER_TAG_NOT_FOUND;

  constructor(missingTagIds: string[], message = 'Some of the tags do not exist') {
    super(message, { missingTagIds });
  }
}
