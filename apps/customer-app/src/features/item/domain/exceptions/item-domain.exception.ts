import { DomainException, Maybe } from '@acme-libs/toolkit';
import { ItemErrorCodeEnum } from '../enums/item-error-code.enum';

export class ItemDomainException extends DomainException {
  public readonly code: ItemErrorCodeEnum;
  public readonly details: Maybe<Readonly<Record<string, unknown>>>;

  constructor(
    code: ItemErrorCodeEnum,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
