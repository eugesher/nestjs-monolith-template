import { DomainException } from '@acme-libs/toolkit';

import { TagErrorCodeEnum } from '../../enums/tag-error-code.enum';

export abstract class TagBaseException extends DomainException {
  public abstract override readonly code: TagErrorCodeEnum;
}
